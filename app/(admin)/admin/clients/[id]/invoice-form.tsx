"use client";

import { useRef, useState } from "react";
import { createInvoiceAction } from "../actions";

export function InvoiceForm({ clientId }: { clientId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    const result = await createInvoiceAction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      formRef.current?.reset();
    }
    setPending(false);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-5">
      <h2 className="font-display text-lg text-navy-900 mb-1">Raise a payment</h2>
      <p className="text-navy-400 text-xs mb-4">
        The client sees this on their dashboard and gets an email with a link to pay.
      </p>
      <input type="hidden" name="clientId" value={clientId} />
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1">Description</label>
          <input
            type="text"
            name="description"
            placeholder="e.g. Application Processing Fee"
            required
            disabled={pending}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-400 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-600 mb-1">Amount (NGN)</label>
          <input
            type="number"
            name="amount"
            min="1"
            step="1"
            placeholder="150000"
            required
            disabled={pending}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-crimson-400 disabled:opacity-50"
          />
        </div>
        {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-green-700 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">Payment raised.</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-crimson-500 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-crimson-400 transition-colors disabled:opacity-50"
        >
          {pending ? "Raising…" : "Raise payment"}
        </button>
      </div>
    </form>
  );
}
