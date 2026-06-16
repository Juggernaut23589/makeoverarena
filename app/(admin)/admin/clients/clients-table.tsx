"use client";

import { useState } from "react";
import { assignAgentAction } from "./actions";
import { cn } from "@/lib/utils";

type Client = {
  id: string;
  full_name: string;
  email: string;
  payment_status: string | null;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  created_at: string;
};

type Agent = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
};

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-orange-100 text-orange-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
};

export function ClientsTable({ clients: initialClients, agents }: { clients: Client[]; agents: Agent[] }) {
  const [clients, setClients] = useState(initialClients);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async (client: Client, agentId: string) => {
    if (!agentId) return;
    setSavingId(client.id);
    setError(null);
    const fd = new FormData();
    fd.set("clientId", client.id);
    fd.set("agentId", agentId);
    const result = await assignAgentAction(fd);
    if (result.error) {
      setError(result.error);
    } else {
      const agent = agents.find((a) => a.id === agentId);
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, assigned_staff_id: agentId, assigned_staff_name: agent?.full_name ?? null } : c))
      );
    }
    setSavingId(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-navy-900">Clients</h1>
        <p className="text-navy-500 text-sm mt-1">
          {clients.length} client{clients.length !== 1 ? "s" : ""} · assign an agent once payment is received
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-navy-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Assigned Agent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => {
                const paymentStatus = client.payment_status ?? "pending";
                const canAssign = paymentStatus === "paid" || paymentStatus === "partial";
                return (
                  <tr key={client.id} className="hover:bg-navy-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-medium text-navy-900">{client.full_name}</div>
                      <div className="text-navy-400 text-xs">{client.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize", PAYMENT_BADGE[paymentStatus] ?? "bg-gray-100 text-gray-600")}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {canAssign ? (
                        <select
                          value={client.assigned_staff_id ?? ""}
                          onChange={(e) => handleAssign(client, e.target.value)}
                          disabled={savingId === client.id}
                          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-50"
                        >
                          <option value="">— Select agent —</option>
                          {agents.map((a) => (
                            <option key={a.id} value={a.id}>{a.full_name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-navy-400 italic">Awaiting payment</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-navy-400 text-xs hidden md:table-cell">
                      {new Date(client.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-navy-400 text-sm">No clients yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
