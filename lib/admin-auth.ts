import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_SECONDS = 8 * 60 * 60;
export const ADMIN_COOKIE = process.env.NODE_ENV === "production" ? "__Host-rsvp-admin" : "rsvp-admin";
export const adminCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/",
};

function sessionKey() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!password || password === "change-me" || !secret) return null;
  return createHmac("sha256", secret).update(`admin-session:${password}`).digest();
}

export function validPassword(candidate: string) {
  if (!sessionKey()) return false;
  const hash = (value: string) => createHmac("sha256", "password-comparison").update(value).digest();
  return timingSafeEqual(hash(candidate), hash(process.env.ADMIN_PASSWORD!));
}

export function createAdminSession(now = Date.now()) {
  const key = sessionKey();
  if (!key) throw new Error("Admin authentication is not configured");
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(24).toString("hex")}`;
  return `${payload}.${createHmac("sha256", key).update(payload).digest("hex")}`;
}

export function isAdmin(req: Request, now = Date.now()) {
  const key = sessionKey();
  if (!key) return false;
  const token = req.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!token || !/^\d{10}\.[0-9a-f]{48}\.[0-9a-f]{64}$/.test(token)) return false;
  const [expiry, nonce, signature] = token.split(".");
  const expiresAt = Number(expiry);
  if (expiresAt <= Math.floor(now / 1000) || expiresAt > Math.floor(now / 1000) + SESSION_SECONDS) return false;
  const expected = createHmac("sha256", key).update(`${expiry}.${nonce}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
