"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  inquiryId: string;
  currentStatus: string;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
}

export function InquiryStatusSelect({ inquiryId, currentStatus, statusColors, statusLabels }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={cn(
          "appearance-none pl-2 pr-6 py-0.5 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-crimson-400 disabled:opacity-60",
          statusColors[status] ?? "bg-gray-100 text-gray-700"
        )}
      >
        {Object.entries(statusLabels).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {saving && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
