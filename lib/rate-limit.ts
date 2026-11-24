import { createHmac } from "node:crypto";
import { json } from "@/lib/http";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_BUCKETS = 10_000;
const buckets = new Map<string, { attempts: number; expiresAt: number }>();
let lastCleanup = 0;

export async function rateLimit(req: Request, scope: "login" | "rsvp") {
  // Only trust a client-IP header explicitly configured for an overwriting proxy.
  const header = process.env.RATE_LIMIT_IP_HEADER;
  const clientIp = header ? req.headers.get(header)?.split(",")[0].trim() : undefined;
  const key = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    .update(`${scope}:${clientIp || "shared"}`).digest("hex");
  const limit = scope === "login" ? (clientIp ? 10 : 30) : (clientIp ? 20 : 120);
  const now = Date.now();
  // Best-effort protection per server instance, without a database dependency.
  if (now - lastCleanup >= 60_000 || buckets.size >= MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(bucketKey);
    }
    lastCleanup = now;
  }
  let bucket = buckets.get(key);
  if (!bucket || bucket.expiresAt <= now) {
    // Bound memory without evicting active limits.
    if (buckets.size >= MAX_BUCKETS) {
      return json({ error: "Too many attempts. Please try again later." }, 429, { "Retry-After": "900" });
    }
    bucket = { attempts: 0, expiresAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.attempts = Math.min(bucket.attempts + 1, limit + 1);
  return bucket.attempts > limit
    ? json({ error: "Too many attempts. Please try again later." }, 429,
      { "Retry-After": String(Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000))) })
    : null;
}
