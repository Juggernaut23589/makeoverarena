import crypto from "crypto";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AdminRole = "super_admin" | "admin" | "staff";

export type StaffAbility =
  | "view_clients"
  | "assign_agents"
  | "manage_scholarships"
  | "view_payments"
  | "view_analytics";

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  abilities?: Partial<Record<StaffAbility, boolean>>;
  isPending?: boolean;
}

export const STAFF_COOKIE_NAME = "staff_session";

export function hasAbility(session: AdminSession | null, ability: StaffAbility): boolean {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  return Boolean(session.abilities?.[ability]);
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
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const b64 = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    if (!b64 || !sig) return null;
    const expected = sign(b64);
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    return JSON.parse(Buffer.from(b64, "base64url").toString()) as AdminSession;
  } catch {
    return null;
  }
}

export function isSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === "super_admin";
}

export function encodeStaffSession(session: AdminSession): string {
  return encodeSession(session);
}

export function decodeStaffSession(token: string): AdminSession | null {
  return decodeSession(token);
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
