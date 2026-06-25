"use client";

import { useState } from "react";
import { inviteAdminAction, updateAdminRoleAction, toggleAdminActiveAction } from "./actions";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  phone?: string;
  avatar_url?: string;
};

export function TeamClient({ members: initialMembers, currentUserId }: { members: Member[]; currentUserId: string }) {
  const [members, setMembers] = useState(initialMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "super_admin">("admin");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    const fd = new FormData();
    fd.set("email", inviteEmail);
    fd.set("fullName", inviteName);
    fd.set("role", inviteRole);
    const result = await inviteAdminAction(fd);
    if (result.error) {
      setInviteError(result.error);
    } else {
      setInviteSuccess(`Invite sent to ${inviteEmail}. They'll receive an email to set their password.`);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("admin");
      if (result.member) setMembers((prev) => [...prev, result.member as Member]);
    }
    setInviting(false);
  };

  const handleToggleActive = async (member: Member) => {
    setActionLoading(`active-${member.id}`);
    const fd = new FormData();
    fd.set("userId", member.id);
    fd.set("isActive", String(!member.is_active));
    const result = await toggleAdminActiveAction(fd);
    if (!result.error) {
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, is_active: !m.is_active } : m));
    }
    setActionLoading(null);
  };

  const handleRoleChange = async (member: Member, newRole: "admin" | "super_admin") => {
    setActionLoading(`role-${member.id}`);
    const fd = new FormData();
    fd.set("userId", member.id);
    fd.set("role", newRole);
    const result = await updateAdminRoleAction(fd);
    if (!result.error) {
      setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: newRole } : m));
    }
    setActionLoading(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Team</h1>
          <p className="text-navy-500 text-sm mt-1">{members.length} admin{members.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteError(""); setInviteSuccess(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          Invite Admin
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white rounded-xl shadow-card border border-border p-6 mb-6">
          <h2 className="font-display text-lg text-navy-900 mb-4">Invite New Admin</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="jane@makeoverarena.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-crimson-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "super_admin")}
                className="h-10 px-3 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-crimson-400"
              >
                <option value="admin">Admin — full access except Settings & Team</option>
                <option value="super_admin">Super Admin — full access to everything</option>
              </select>
            </div>
            {inviteError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{inviteError}</p>}
            {inviteSuccess && <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">{inviteSuccess}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={inviting}
                className="px-5 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors disabled:opacity-60"
              >
                {inviting ? "Sending invite…" : "Send Invite"}
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-5 py-2.5 border border-border text-navy-600 rounded-lg text-sm hover:bg-navy-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-navy-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Admin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => {
                const isSelf = member.id === currentUserId;
                return (
                  <tr key={member.id} className="hover:bg-navy-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-semibold text-sm shrink-0">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-navy-900">
                            {member.full_name}
                            {isSelf && <span className="ml-2 text-xs text-navy-400">(you)</span>}
                          </div>
                          <div className="text-navy-400 text-xs">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {isSelf ? (
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", member.role === "super_admin" ? "bg-crimson-100 text-crimson-800" : "bg-navy-100 text-navy-700")}>
                          {member.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member, e.target.value as "admin" | "super_admin")}
                          disabled={actionLoading === `role-${member.id}`}
                          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-crimson-400 disabled:opacity-50"
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", member.is_active ? "text-green-700" : "text-red-600")}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", member.is_active ? "bg-green-500" : "bg-red-400")} />
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-navy-400 text-xs hidden md:table-cell">
                      {new Date(member.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleActive(member)}
                          disabled={actionLoading === `active-${member.id}`}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50",
                            member.is_active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          )}
                        >
                          {actionLoading === `active-${member.id}` ? "…" : member.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
