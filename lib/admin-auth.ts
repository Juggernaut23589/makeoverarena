import crypto from "crypto";

const SECRET = process.env.ADMIN_PASSWORD ?? "dev-secret-change-me";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export const COOKIE_NAME = "admin_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function generateToken(): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(ADMIN_EMAIL + ADMIN_PASSWORD)
    .digest("hex");
}

export function verifyToken(token: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const expected = generateToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkCredentials(email: string, password: string): boolean {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false;
  const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
  let passOk = false;
  try {
    passOk = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(ADMIN_PASSWORD)
    );
  } catch {
    return false;
  }
  return emailOk && passOk;
}
