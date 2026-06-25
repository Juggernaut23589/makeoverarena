// Uses only Web Crypto API (crypto.subtle) so this module runs in both
// the Node.js runtime (API routes) and the Edge runtime (middleware).

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

const SECRET_STRING =
  process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "dev-secret";

// Encode Uint8Array → base64url string without Buffer
function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Decode base64url string → Uint8Array without Buffer
function fromBase64url(b64url: string): Uint8Array {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacHex(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_STRING),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encodeSession(session: AdminSession): Promise<string> {
  const b64 = toBase64url(new TextEncoder().encode(JSON.stringify(session)));
  const sig = await hmacHex(b64);
  return `${b64}.${sig}`;
}

export async function decodeSession(token: string): Promise<AdminSession | null> {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const b64 = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    if (!b64 || !sig) return null;
    const expected = await hmacHex(b64);
    if (sig.length !== expected.length) return null;
    // Constant-time comparison — works in all runtimes
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff !== 0) return null;
    return JSON.parse(new TextDecoder().decode(fromBase64url(b64))) as AdminSession;
  } catch {
    return null;
  }
}

export function isSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === "super_admin";
}

export async function encodeStaffSession(session: AdminSession): Promise<string> {
  return encodeSession(session);
}

export async function decodeStaffSession(token: string): Promise<AdminSession | null> {
  return decodeSession(token);
}

// Routes only super_admin can access
export const SUPER_ADMIN_ROUTES = ["/admin/settings", "/admin/team"];

export function canAccess(session: AdminSession | null, pathname: string): boolean {
  if (!session) return false;
  if (SUPER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    return session.role === "super_admin";
  }
  return true;
}
