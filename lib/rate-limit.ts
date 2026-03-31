import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// Lazy-initialised so the module doesn't throw at import time if env vars aren't set
let redis: Redis | null = null;
let inquiryLimiter: Ratelimit | null = null;
let chatbotLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function getInquiryLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  if (!inquiryLimiter) {
    inquiryLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 submissions per IP per hour
      analytics: true,
      prefix: "makeoverarena:inquiry",
    });
  }
  return inquiryLimiter;
}

function getChatbotLimiter(): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  if (!chatbotLimiter) {
    chatbotLimiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 messages per IP per minute
      analytics: true,
      prefix: "makeoverarena:chatbot",
    });
  }
  return chatbotLimiter;
}

/**
 * Returns the caller's IP address from the Next.js request.
 */
export function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Check inquiry rate limit. Returns { allowed, remaining, reset }.
 * If Upstash is not configured, always returns allowed = true.
 */
export async function checkInquiryLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limiter = getInquiryLimiter();
  if (!limiter) return { allowed: true, remaining: 99, reset: 0 };

  const { success, remaining, reset } = await limiter.limit(ip);
  return { allowed: success, remaining, reset };
}

/**
 * Check chatbot rate limit.
 */
export async function checkChatbotLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limiter = getChatbotLimiter();
  if (!limiter) return { allowed: true, remaining: 99, reset: 0 };

  const { success, remaining, reset } = await limiter.limit(ip);
  return { allowed: success, remaining, reset };
}
