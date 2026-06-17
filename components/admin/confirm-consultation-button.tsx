"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ConfirmConsultationButton({ consultationId }: { consultationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}/confirm`, { method: "POST" });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to confirm");
        return;
      }
      toast.success("Consultation confirmed — client notified by email");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors font-medium disabled:opacity-60 whitespace-nowrap"
    >
      {loading ? "…" : "Confirm"}
    </button>
  );
}
