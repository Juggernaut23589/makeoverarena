"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createAccessClass,
  updateAccessClass,
  setAccessClassActive,
  deleteAccessClass,
  createAccessPeriod,
  updateAccessPeriod,
  setAccessPeriodActive,
  deleteAccessPeriod,
  updatePriceMatrix,
} from "@/app/staff/(portal)/dashboard/pricing-actions";

export interface AccessClassRow {
  id: string;
  name: string;
  slug: string;
  rank: number;
  description: string | null;
  is_active: boolean;
}

export interface AccessPeriodRow {
  id: string;
  label: string;
  duration_days: number;
  display_order: number;
  is_active: boolean;
}

export interface AccessClassPriceRow {
  class_id: string;
  period_id: string;
  price_naira: number;
}

const inputClass =
  "w-full rounded-lg bg-navy-950 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-crimson-400";
const labelClass = "block text-xs text-white/50 mb-1";

function ClassForm({ initial, onDone }: { initial?: AccessClassRow; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = initial ? await updateAccessClass(initial.id, formData) : await createAccessClass(formData);
      if (result.error) setError(result.error);
      else { router.refresh(); onDone(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-900/50 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Name *</label>
          <input name="name" defaultValue={initial?.name} required className={inputClass} placeholder="e.g. Standard" />
        </div>
        <div>
          <label className={labelClass}>Rank (higher = more access) *</label>
          <input type="number" name="rank" defaultValue={initial?.rank} required min={0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input name="description" defaultValue={initial?.description ?? ""} className={inputClass} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="px-3 py-1.5 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400 disabled:opacity-50">
          {isPending ? "Saving…" : initial ? "Save" : "Add class"}
        </button>
        <button type="button" onClick={onDone} disabled={isPending} className="px-3 py-1.5 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/5">
          Cancel
        </button>
      </div>
    </form>
  );
}

function PeriodForm({ initial, onDone }: { initial?: AccessPeriodRow; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = initial ? await updateAccessPeriod(initial.id, formData) : await createAccessPeriod(formData);
      if (result.error) setError(result.error);
      else { router.refresh(); onDone(); }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-900/50 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Label *</label>
          <input name="label" defaultValue={initial?.label} required className={inputClass} placeholder="e.g. 3 Months" />
        </div>
        <div>
          <label className={labelClass}>Duration (days) *</label>
          <input type="number" name="duration_days" defaultValue={initial?.duration_days} required min={1} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Display order</label>
          <input type="number" name="display_order" defaultValue={initial?.display_order ?? 0} className={inputClass} />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="px-3 py-1.5 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400 disabled:opacity-50">
          {isPending ? "Saving…" : initial ? "Save" : "Add period"}
        </button>
        <button type="button" onClick={onDone} disabled={isPending} className="px-3 py-1.5 border border-white/10 text-white/60 rounded-lg text-sm hover:bg-white/5">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PricingManager({
  classes,
  periods,
  prices,
}: {
  classes: AccessClassRow[];
  periods: AccessPeriodRow[];
  prices: AccessClassPriceRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addingClass, setAddingClass] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [addingPeriod, setAddingPeriod] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const priceMap = new Map(prices.map((p) => [`${p.class_id}__${p.period_id}`, p.price_naira]));
  const sortedClasses = [...classes].sort((a, b) => b.rank - a.rank);
  const sortedPeriods = [...periods].sort((a, b) => a.display_order - b.display_order);

  function handleDeleteClass(id: string) {
    if (!window.confirm("Delete this class permanently?")) return;
    startTransition(async () => {
      const result = await deleteAccessClass(id);
      if (result.error) window.alert(result.error);
      router.refresh();
    });
  }

  function handleDeletePeriod(id: string) {
    if (!window.confirm("Delete this period permanently?")) return;
    startTransition(async () => {
      const result = await deleteAccessPeriod(id);
      if (result.error) window.alert(result.error);
      router.refresh();
    });
  }

  function handleToggleClass(id: string, active: boolean) {
    startTransition(async () => { await setAccessClassActive(id, active); router.refresh(); });
  }

  function handleTogglePeriod(id: string, active: boolean) {
    startTransition(async () => { await setAccessPeriodActive(id, active); router.refresh(); });
  }

  function handlePriceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPriceError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePriceMatrix(formData);
      if (result.error) setPriceError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-white">Pricing</h2>
      <p className="text-sm text-white/40">
        Super-admin only. Classes control which scholarships a client can see (hierarchical by
        rank — a higher-rank class also sees everything lower ranks see). Periods control how
        long a purchase lasts. Prices below are what a client pays for each class × period.
      </p>

      {/* Classes */}
      <div className="bg-navy-800 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Access classes</h3>
          <button onClick={() => { setAddingClass((v) => !v); setEditingClassId(null); }} className="px-3 py-1.5 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400">
            {addingClass ? "Close" : "+ Add class"}
          </button>
        </div>
        {addingClass && <ClassForm onDone={() => setAddingClass(false)} />}
        <div className="divide-y divide-white/5">
          {sortedClasses.map((c) => (
            <div key={c.id}>
              <div className="flex items-center justify-between py-2.5 gap-3 flex-wrap">
                <div>
                  <p className="text-white text-sm font-medium">{c.name} <span className="text-white/30 text-xs">rank {c.rank}</span></p>
                  {c.description && <p className="text-white/40 text-xs">{c.description}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleToggleClass(c.id, !c.is_active)} disabled={isPending} className={`px-2 py-1 rounded text-xs border ${c.is_active ? "border-green-500/20 text-green-400 bg-green-500/10" : "border-white/10 text-white/40"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => { setEditingClassId(editingClassId === c.id ? null : c.id); setAddingClass(false); }} className="px-2 py-1 border border-white/10 text-white/60 rounded text-xs hover:bg-white/5">Edit</button>
                  <button onClick={() => handleDeleteClass(c.id)} disabled={isPending} className="px-2 py-1 border border-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/10 disabled:opacity-50">Delete</button>
                </div>
              </div>
              {editingClassId === c.id && <ClassForm initial={c} onDone={() => setEditingClassId(null)} />}
            </div>
          ))}
          {sortedClasses.length === 0 && <p className="text-white/30 text-sm py-4">No classes yet.</p>}
        </div>
      </div>

      {/* Periods */}
      <div className="bg-navy-800 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Access periods</h3>
          <button onClick={() => { setAddingPeriod((v) => !v); setEditingPeriodId(null); }} className="px-3 py-1.5 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400">
            {addingPeriod ? "Close" : "+ Add period"}
          </button>
        </div>
        {addingPeriod && <PeriodForm onDone={() => setAddingPeriod(false)} />}
        <div className="divide-y divide-white/5">
          {sortedPeriods.map((p) => (
            <div key={p.id}>
              <div className="flex items-center justify-between py-2.5 gap-3 flex-wrap">
                <p className="text-white text-sm font-medium">{p.label} <span className="text-white/30 text-xs">{p.duration_days} days</span></p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleTogglePeriod(p.id, !p.is_active)} disabled={isPending} className={`px-2 py-1 rounded text-xs border ${p.is_active ? "border-green-500/20 text-green-400 bg-green-500/10" : "border-white/10 text-white/40"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => { setEditingPeriodId(editingPeriodId === p.id ? null : p.id); setAddingPeriod(false); }} className="px-2 py-1 border border-white/10 text-white/60 rounded text-xs hover:bg-white/5">Edit</button>
                  <button onClick={() => handleDeletePeriod(p.id)} disabled={isPending} className="px-2 py-1 border border-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/10 disabled:opacity-50">Delete</button>
                </div>
              </div>
              {editingPeriodId === p.id && <PeriodForm initial={p} onDone={() => setEditingPeriodId(null)} />}
            </div>
          ))}
          {sortedPeriods.length === 0 && <p className="text-white/30 text-sm py-4">No periods yet.</p>}
        </div>
      </div>

      {/* Price matrix */}
      <div className="bg-navy-800 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-white font-semibold">Price matrix (₦)</h3>
        {sortedClasses.length === 0 || sortedPeriods.length === 0 ? (
          <p className="text-white/30 text-sm">Add at least one class and one period first.</p>
        ) : (
          <form onSubmit={handlePriceSubmit} className="space-y-3">
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-white/50 font-medium">Class \ Period</th>
                    {sortedPeriods.map((p) => (
                      <th key={p.id} className="px-3 py-2 text-left text-white/50 font-medium">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedClasses.map((c) => (
                    <tr key={c.id} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white/70 whitespace-nowrap">{c.name}</td>
                      {sortedPeriods.map((p) => (
                        <td key={p.id} className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            name={`price__${c.id}__${p.id}`}
                            defaultValue={priceMap.get(`${c.id}__${p.id}`) ?? ""}
                            placeholder="—"
                            className="w-28 rounded-lg bg-navy-950 border border-white/10 px-2 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-crimson-400"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {priceError && <p className="text-red-400 text-sm">{priceError}</p>}
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-crimson-500 text-white rounded-lg text-sm font-semibold hover:bg-crimson-400 disabled:opacity-50">
              {isPending ? "Saving…" : "Save prices"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
