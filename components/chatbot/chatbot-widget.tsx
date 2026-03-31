"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "👋 Hi! I'm here to help you with your study abroad journey.\n\nI can answer questions about:\n• Our services and pricing\n• Application requirements\n• Country-specific information\n• Timeline and process\n\nWhat would you like to know?",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "How much does it cost?",
  "What documents do I need?",
  "How long does it take?",
  "Do you help with scholarships?",
];

// Generate a stable session ID for the browser tab
function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("chatbot-session-id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chatbot-session-id", id);
  }
  return id;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const sessionId = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionId.current = getSessionId();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId: sessionId.current,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content || "I'm sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (!isOpen) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again or contact us directly at info@makeoverarena.com",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isOpen, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat window */}
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[min(320px,calc(100vw-2rem))] sm:w-96 bg-white rounded-2xl shadow-elevated border border-border overflow-hidden transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ maxHeight: "min(520px, calc(100vh - 100px))" }}
      >
        {/* Header */}
        <div className="bg-navy-900 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-navy-900 font-bold text-sm font-display">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">MakeoverArena</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/50 text-xs">Online — replies instantly</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ height: "320px" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-xs font-bold text-navy-700 mr-2 mt-0.5 shrink-0">
                  M
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                  msg.role === "user"
                    ? "bg-navy-900 text-white rounded-br-sm"
                    : "bg-navy-50 text-navy-800 rounded-bl-sm"
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-xs font-bold text-navy-700 mr-2 shrink-0">M</div>
              <div className="bg-navy-50 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-navy-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="px-3 py-1 text-xs border border-navy-200 rounded-full text-navy-700 hover:bg-navy-50 hover:border-navy-400 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-10 px-4 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-gold-400 bg-navy-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-gold-500 text-navy-900 rounded-xl flex items-center justify-center hover:bg-gold-400 disabled:opacity-50 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-center text-xs text-navy-400 mt-2">
            Powered by AI · <a href="/book" className="text-gold-600 hover:underline">Talk to a human</a>
          </p>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-elevated transition-all duration-200 hover:scale-105 active:scale-95 relative",
          isOpen ? "bg-navy-800" : "bg-navy-900"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200",
            isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          )}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-200",
            isOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"
          )}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>

        {/* Unread badge */}
        {!isOpen && unread > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </div>
        )}
        {!isOpen && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
}
