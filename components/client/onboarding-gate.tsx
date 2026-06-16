"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface Scholarship {
  id: string;
  name: string;
  description: string | null;
  destination_country: string | null;
  amount: string | null;
  tuition_range: string | null;
  application_url: string | null;
}

interface Props {
  clientId: string;
  documentsCompleted: boolean;
  consultationBooked: boolean;
  onComplete?: () => void;
}

const EDUCATION_LEVELS = ["high_school", "undergraduate", "graduate", "phd"];
const DOC_TYPE_LABELS: Record<string, string> = {
  transcript: "Academic Transcript",
  certificate: "Certificate",
  id: "ID Card",
  passport: "Passport",
  other: "Other",
};

export function OnboardingGate({ clientId, documentsCompleted, consultationBooked, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(documentsCompleted ? (consultationBooked ? 3 : 2) : 1);

  // Step 1: academic info
  const [educationLevel, setEducationLevel] = useState("undergraduate");
  const [gpaScale, setGpaScale] = useState<"4.0" | "5.0">("5.0");
  const [gpa, setGpa] = useState("");
  const [isPassFail, setIsPassFail] = useState(false);
  const [savingAcademic, setSavingAcademic] = useState(false);
  const [matchKind, setMatchKind] = useState<"scholarships" | "low_tuition" | null>(null);
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Step 2: documents
  const [docType, setDocType] = useState("transcript");
  const [uploading, setUploading] = useState(false);
  const [uploadedAny, setUploadedAny] = useState(documentsCompleted);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (documentsCompleted && consultationBooked) onComplete?.();
  }, [documentsCompleted, consultationBooked, onComplete]);

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const params = new URLSearchParams({ is_pass_fail: String(isPassFail) });
      if (!isPassFail) {
        params.set("gpa", gpa);
        params.set("gpa_scale", gpaScale);
      }
      const res = await fetch(`/api/scholarships?${params.toString()}`);
      const data = (await res.json()) as { kind: "scholarships" | "low_tuition"; items: Scholarship[] };
      setMatchKind(data.kind);
      setMatches(data.items ?? []);
    } catch {
      // non-blocking
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSaveAcademic = async () => {
    if (!isPassFail && !gpa) {
      toast.error("Enter your GPA, or check the pass/fail box");
      return;
    }
    setSavingAcademic(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          education_level: educationLevel,
          is_pass_fail: isPassFail,
          gpa: isPassFail ? null : parseFloat(gpa),
          gpa_scale: isPassFail ? null : gpaScale,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to save academic info");
        return;
      }
      await fetchMatches();
      setStep(2);
    } finally {
      setSavingAcademic(false);
    }
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("Please select a file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", clientId);
    formData.append("document_type", docType);

    try {
      const res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Upload failed");
        return;
      }
      toast.success("Document uploaded");
      setUploadedAny(true);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-card border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-gold-500" : "bg-navy-100"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-navy-900">Tell us about your academics</h2>
            <p className="text-navy-500 text-sm">This helps us match you with the right scholarships.</p>

            <div>
              <label className="block text-xs font-semibold text-navy-700 mb-1.5">Education Level</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                {EDUCATION_LEVELS.map((l) => (
                  <option key={l} value={l}>{l.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" checked={isPassFail} onChange={(e) => setIsPassFail(e.target.checked)} />
              My program is graded pass/fail (no GPA)
            </label>

            {!isPassFail && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">GPA Scale</label>
                  <select
                    value={gpaScale}
                    onChange={(e) => setGpaScale(e.target.value as "4.0" | "5.0")}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                  >
                    <option value="4.0">4.0 Scale</option>
                    <option value="5.0">5.0 Scale</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">Your GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={gpaScale}
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder={`e.g. ${gpaScale === "5.0" ? "4.20" : "3.40"}`}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-navy-50 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                </div>
              </div>
            )}

            {matchKind && (
              <div className="bg-navy-50 rounded-lg p-4 text-sm">
                {loadingMatches ? (
                  <p className="text-navy-500">Finding matches…</p>
                ) : matchKind === "low_tuition" ? (
                  <p className="text-navy-700">
                    Based on your GPA, we&apos;ll show you <strong>low-tuition packages</strong> instead of merit scholarships — {matches.length} found.
                  </p>
                ) : (
                  <p className="text-navy-700">
                    You qualify for <strong>{matches.length} scholarship{matches.length !== 1 ? "s" : ""}</strong> — view them in your dashboard.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSaveAcademic}
              disabled={savingAcademic}
              className="w-full py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors disabled:opacity-60"
            >
              {savingAcademic ? "Saving…" : "Continue"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl text-navy-900">Upload your documents</h2>
            <p className="text-navy-500 text-sm">Upload at least one document (transcript or certificate) to continue.</p>

            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-border rounded-lg bg-navy-50 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              {Object.entries(DOC_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full text-sm text-navy-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2.5 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload Document"}
            </button>

            {uploadedAny && (
              <button
                onClick={() => setStep(3)}
                className="w-full py-2.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <h2 className="font-display text-xl text-navy-900">Book your free consultation</h2>
            <p className="text-navy-500 text-sm">
              Last step — book your free 15-minute consultation. Once it&apos;s scheduled, your full dashboard unlocks.
            </p>
            <a
              href="/book"
              className="inline-block w-full py-2.5 bg-gold-500 text-navy-900 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
            >
              Book Free Consultation →
            </a>
            <p className="text-navy-400 text-xs">
              Already booked? <button onClick={() => window.location.reload()} className="underline">Refresh this page</button>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
