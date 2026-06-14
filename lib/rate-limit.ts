import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Sliding-window rate limiter backed by Supabase (PostgreSQL).
 * Fails open — if the DB is unavailable, requests are allowed through.
 *
 * @param key      Unique key, e.g. "inquiry:127.0.0.1"
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
async function check(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!supabaseAdmin) return { allowed: true, remaining: limit };

  try {
    const now = Date.now();
    const windowStart = new Date(now - windowMs).toISOString();

    // Upsert: increment hit count for this key within the current window.
    // If key is new or the window has expired, reset to 1.
    const { data, error } = await supabaseAdmin
      .from("rate_limits")
      .upsert(
        { key, hits: 1, window_start: new Date(now).toISOString() },
        { onConflict: "key", ignoreDuplicates: false }
      )
      .select("hits, window_start")
      .single();

    if (error || !data) return { allowed: true, remaining: limit };

    // If the stored window_start is older than our window, this is a new window — reset.
    const storedWindowStart = new Date(data.window_start).toISOString();
    if (storedWindowStart < windowStart) {
      await supabaseAdmin
        .from("rate_limits")
        .update({ hits: 1, window_start: new Date(now).toISOString() })
        .eq("key", key);
      return { allowed: true, remaining: limit - 1 };
    }

    // Otherwise increment.
    const { data: updated } = await supabaseAdmin
      .from("rate_limits")
      .update({ hits: data.hits + 1 })
      .eq("key", key)
      .gt("window_start", windowStart) // only update if still in window
      .select("hits")
      .single();

    const hits = updated?.hits ?? data.hits + 1;
    const remaining = Math.max(0, limit - hits);
    return { allowed: hits <= limit, remaining };
  } catch {
    return { allowed: true, remaining: limit };
  }
}

/** 5 submissions per IP per hour */
export async function checkInquiryLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const result = await check(`inquiry:${ip}`, 5, 60 * 60 * 1000);
  return { ...result, reset: 0 };
}

/** 3 payment initiations per IP per 10 minutes */
export async function checkPaymentLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const result = await check(`payment:${ip}`, 3, 10 * 60 * 1000);
  return { ...result, reset: 0 };
}

/** 30 chatbot messages per IP per minute */
export async function checkChatbotLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const result = await check(`chatbot:${ip}`, 30, 60 * 1000);
  return { ...result, reset: 0 };
}
