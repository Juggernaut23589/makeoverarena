"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const reference = params.get("reference");
  const trxref = params.get("trxref");
  const ref = reference ?? trxref;

  useEffect(() => {
    if (!ref) { setStatus("failed"); return; }
    fetch(`/api/payments/verify?reference=${ref}`)
      .then((r) => r.json())
      .then((d: { success?: boolean }) => setStatus(d.success ? "success" : "failed"))
      .catch(() => setStatus("failed"));
  }, [ref]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-crimson-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="font-display text-2xl text-navy-900 mb-3">Verifying payment…</h1>
            <p className="text-navy-500 text-sm">Please wait while we confirm your payment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-navy-900 mb-3">Payment Successful!</h1>
            <p className="text-navy-500 text-sm mb-8">
              Your payment has been confirmed. Your advisor will be in touch shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-colors"
              >
                Go to My Dashboard
              </Link>
              <Link href="/" className="text-sm text-navy-500 hover:text-navy-700">
                Return to Home
              </Link>
            </div>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-display text-2xl text-navy-900 mb-3">Payment Failed</h1>
            <p className="text-navy-500 text-sm mb-8">
              Your payment could not be confirmed. Please try again or contact your advisor.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-crimson-500 text-white rounded-xl font-semibold text-sm hover:bg-crimson-400 transition-colors"
              >
                Try Again
              </Link>
              <a href="mailto:info@makeoverarena.com" className="text-sm text-navy-500 hover:text-navy-700">
                Contact Advisor
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-crimson-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
