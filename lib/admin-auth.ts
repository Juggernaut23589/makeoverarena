import crypto from "crypto";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminRole = "super_admin" | "admin";

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: AdminRole;
}

const SECRET = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "dev-secret";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function encodeSession(session: AdminSession): string {
  const payload = JSON.stringify(session);
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function decodeSession(token: string): AdminSession | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const expected = sign(b64);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(b64, "base64url").toString()) as AdminSession;
  } catch {
    return null;
  }
}

export function isSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === "super_admin";
}

// Routes only super_admin can access
export const SUPER_ADMIN_ROUTES = ["/admin/settings", "/admin/team", "/admin/clients"];

export function canAccess(session: AdminSession | null, pathname: string): boolean {
  if (!session) return false;
  if (SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    return session.role === "super_admin";
  }
  return true;
}
