"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  wa_phone_number: string;
  customer_name: string | null;
  customer_profile_name: string | null;
  last_message: string | null;
  last_message_at: string | null;
  status: string;
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  content: string | null;
  media_url: string | null;
  media_filename: string | null;
  status: string;
  created_at: string;
  timestamp_wa: string | null;
}

// ── Realtime client (anon key — read-only Realtime subscription) ──────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const realtimeClient   = SUPABASE_URL && SUPABASE_ANON
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

const STATUS_FILTERS = ["all", "open", "pending", "resolved"] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function WhatsAppInbox() {
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeId, setActiveId]             = useState<string | null>(null);
  const [messages, setMessages]             = useState<Message[]>([]);
  const [draft, setDraft]                   = useState("");
  const [sending, setSending]               = useState(false);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [statusFilter, setStatusFilter]     = useState<string>("all");
  const [search, setSearch]                 = useState("");
  const [mobileView, setMobileView]         = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;
  const displayName = (c: Conversation) =>
    c.customer_name ?? c.customer_profile_name ?? formatPhone(c.wa_phone_number);

  // ── Fetch conversations ──────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const url = statusFilter !== "all"
        ? `/api/whatsapp/conversations?status=${statusFilter}`
        : "/api/whatsapp/conversations";
      const res = await fetch(url);
      const data = (await res.json()) as { conversations: Conversation[] };
      setConversations(data.conversations ?? []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoadingConvs(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Fetch messages for active conversation ───────────────────────────────
  const fetchMessages = useCallback(async (id: string) => {
    setLoadingMsgs(true);
    try {
      const res  = await fetch(`/api/whatsapp/conversations/${id}`);
      const data = (await res.json()) as { messages: Message[] };
      setMessages(data.messages ?? []);
      // Zero out unread in local state
      setConversations((prev) =>
        prev.map((c) => c.id === id ? { ...c, unread_count: 0 } : c)
      );
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setDraft("");
    setMobileView("chat");
    await fetchMessages(id);
  }, [fetchMessages]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Supabase Realtime — live updates for new inbound messages ────────────
  useEffect(() => {
    if (!realtimeClient || !activeId) return;

    const channel = realtimeClient
      .channel(`wa-messages-${activeId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "whatsapp_messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: { new: any }) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { realtimeClient.removeChannel(channel); };
  }, [activeId]);

  // ── Realtime — conversation list refreshes when any convo updates ────────
  useEffect(() => {
    if (!realtimeClient) return;

    const channel = realtimeClient
      .channel("wa-conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_conversations" },
        () => { fetchConversations(); }
      )
      .subscribe();

    return () => { realtimeClient.removeChannel(channel); };
  }, [fetchConversations]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim() || !activeConv || sending) return;
    const text = draft.trim();
    setSending(true);
    setDraft("");

    // Optimistic UI
    const optimistic: Message = {
      id:           "opt-" + Date.now(),
      direction:    "outbound",
      message_type: "text",
      content:      text,
      media_url:    null,
      media_filename: null,
      status:       "sent",
      created_at:   new Date().toISOString(),
      timestamp_wa: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeConv.id,
          to:              activeConv.wa_phone_number,
          message:         text,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        // Rollback optimistic + restore draft
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setDraft(text);
        toast.error(data.error ?? "Failed to send message");
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
      toast.error("Network error — message not sent");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Update conversation status ────────────────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, status } : c)
    );
    await fetch(`/api/whatsapp/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  // ── Filtered conversations ────────────────────────────────────────────────
  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return displayName(c).toLowerCase().includes(q) ||
           c.wa_phone_number.includes(q) ||
           (c.last_message ?? "").toLowerCase().includes(q);
  });

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── LEFT PANEL — Conversation list ────────────────────────────────── */}
      <div className={cn(
        "flex flex-col border-r border-border bg-white",
        "w-full lg:w-80 xl:w-96 shrink-0",
        // Mobile: hide list when chat open
        mobileView === "chat" ? "hidden lg:flex" : "flex"
      )}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h1 className="font-semibold text-navy-900 text-sm">WhatsApp Inbox</h1>
                {totalUnread > 0 && (
                  <p className="text-xs text-navy-500">{totalUnread} unread</p>
                )}
              </div>
            </div>
            <button
              onClick={fetchConversations}
              className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full h-8 pl-8 pr-3 text-xs border border-border rounded-lg bg-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors",
                  statusFilter === f
                    ? "bg-navy-900 text-white"
                    : "text-navy-500 hover:bg-navy-50 hover:text-navy-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 bg-navy-50 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-navy-400 text-sm font-medium">No conversations</p>
              <p className="text-navy-300 text-xs mt-1">
                Messages sent to your WhatsApp Business number will appear here.
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 hover:bg-navy-50/60 transition-colors flex items-start gap-3",
                  activeId === conv.id && "bg-navy-50"
                )}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                  {displayName(conv).charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm truncate", conv.unread_count > 0 ? "font-semibold text-navy-900" : "font-medium text-navy-800")}>
                      {displayName(conv)}
                    </span>
                    <span className="text-xs text-navy-400 shrink-0">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={cn("text-xs truncate", conv.unread_count > 0 ? "text-navy-700 font-medium" : "text-navy-400")}>
                      {conv.last_message ?? "No messages yet"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="w-4.5 h-4.5 min-w-[18px] bg-[#25D366] text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 px-1">
                        {conv.unread_count > 9 ? "9+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-navy-300">{conv.wa_phone_number}</span>
                    <StatusPill status={conv.status} />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL — Chat thread ──────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        mobileView === "list" ? "hidden lg:flex" : "flex"
      )}>
        {!activeConv ? (
          <EmptyState />
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-border bg-white shrink-0">
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileView("list")}
                className="lg:hidden p-1.5 -ml-1 text-navy-500 hover:text-navy-900 rounded-lg hover:bg-navy-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shrink-0 text-white font-semibold text-sm">
                {displayName(activeConv).charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-900 text-sm truncate">{displayName(activeConv)}</p>
                <p className="text-xs text-navy-400">{activeConv.wa_phone_number}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Status select */}
                <select
                  value={activeConv.status}
                  onChange={(e) => updateStatus(activeConv.id, e.target.value)}
                  className="h-7 px-2 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-gold-400 text-navy-700"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="spam">Spam</option>
                </select>

                {/* Open in WhatsApp */}
                <a
                  href={`https://wa.me/${activeConv.wa_phone_number.replace(/^\+/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-navy-400 hover:text-[#25D366] hover:bg-navy-50 transition-colors"
                  title="Open in WhatsApp"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-2"
              style={{ background: "#ECE5DD" }}
            >
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500 bg-white/70 px-4 py-2 rounded-full">
                    No messages yet — say hello!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isOutbound = msg.direction === "outbound";
                    const showDateHeader = i === 0 ||
                      formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at);
                    return (
                      <div key={msg.id}>
                        {showDateHeader && (
                          <div className="flex justify-center my-3">
                            <span className="text-xs text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={cn("flex", isOutbound ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[75%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 shadow-sm",
                              isOutbound
                                ? "bg-[#DCF8C6] rounded-br-sm"
                                : "bg-white rounded-bl-sm"
                            )}
                          >
                            {msg.message_type === "text" ? (
                              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            ) : msg.message_type === "image" ? (
                              <div>
                                {msg.media_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={msg.media_url} alt="Image" className="rounded-lg max-w-full mb-1" />
                                ) : (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Photo
                                  </div>
                                )}
                              </div>
                            ) : msg.message_type === "document" ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="truncate">{msg.media_filename ?? "Document"}</span>
                              </div>
                            ) : msg.message_type === "audio" ? (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Voice message
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic capitalize">[{msg.message_type}]</p>
                            )}

                            {/* Time + status */}
                            <div className={cn("flex items-center gap-1 mt-1", isOutbound ? "justify-end" : "justify-start")}>
                              <span className="text-[10px] text-gray-500">
                                {formatMsgTime(msg.timestamp_wa ?? msg.created_at)}
                              </span>
                              {isOutbound && <MessageStatusIcon status={msg.status} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-border bg-white px-3 py-3 shrink-0">
              {activeConv.status === "resolved" ? (
                <div className="flex items-center justify-between gap-3 py-1">
                  <p className="text-sm text-navy-400">This conversation is resolved.</p>
                  <button
                    onClick={() => updateStatus(activeConv.id, "open")}
                    className="text-xs px-3 py-1.5 border border-border rounded-lg text-navy-700 hover:bg-navy-50 transition-colors font-medium"
                  >
                    Reopen
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                    rows={1}
                    className="flex-1 resize-none px-3.5 py-2.5 text-sm rounded-xl border border-border bg-navy-50 focus:outline-none focus:ring-2 focus:ring-[#25D366] placeholder:text-navy-300 max-h-32"
                    style={{ lineHeight: "1.5" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!draft.trim() || sending}
                    className="w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#20bc5a] disabled:opacity-40 transition-colors shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8"
      style={{ background: "#ECE5DD" }}>
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm">
        <svg className="w-10 h-10 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
      <h3 className="font-display text-xl text-navy-700 mb-2">WhatsApp Inbox</h3>
      <p className="text-navy-400 text-sm max-w-xs leading-relaxed">
        Select a conversation from the list, or wait for new messages from your customers.
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open:     "bg-green-100 text-green-700",
    pending:  "bg-yellow-100 text-yellow-700",
    resolved: "bg-gray-100 text-gray-600",
    spam:     "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize", styles[status] ?? "bg-gray-100 text-gray-600")}>
      {status}
    </span>
  );
}

function MessageStatusIcon({ status }: { status: string }) {
  if (status === "read") {
    return (
      <svg className="w-3.5 h-3.5 text-[#53bdeb]" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.071.653a.75.75 0 010 1.061L5.243 7.543l-2.96-2.96a.75.75 0 011.06-1.06l1.9 1.9L10.01.653a.75.75 0 011.061 0z"/>
        <path d="M15.071.653a.75.75 0 010 1.061L9.243 7.543l-.53-.53 5.297-5.299a.75.75 0 011.061 0z"/>
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 11" fill="currentColor">
        <path d="M11.071.653a.75.75 0 010 1.061L5.243 7.543l-2.96-2.96a.75.75 0 011.06-1.06l1.9 1.9L10.01.653a.75.75 0 011.061 0z"/>
        <path d="M15.071.653a.75.75 0 010 1.061L9.243 7.543l-.53-.53 5.297-5.299a.75.75 0 011.061 0z"/>
      </svg>
    );
  }
  // sent = single tick
  return (
    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 11" fill="currentColor">
      <path d="M9.53.47a.75.75 0 010 1.06L4.06 7 1.47 4.41a.75.75 0 111.06-1.06l1.53 1.53L8.47.47a.75.75 0 011.06 0z"/>
    </svg>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatPhone(phone: string) {
  return phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return d.toLocaleDateString("en-NG", { weekday: "short" });
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" });
}
