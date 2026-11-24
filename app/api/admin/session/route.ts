import { ADMIN_COOKIE, adminCookieOptions, createAdminSession, SESSION_SECONDS, validPassword } from "@/lib/admin-auth";
import { errorResponse, HttpError, isRecord, json, readJson, requireSameOrigin } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    requireSameOrigin(req);
    const body = await readJson(req, 2048);
    if (!isRecord(body) || typeof body.password !== "string" || body.password.length > 512) throw new HttpError(400, "Invalid password");
    const limited = await rateLimit(req);
    if (limited) return limited;
    if (!validPassword(body.password)) return json({ error: "Unauthorized" }, 401);
    const response = json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(), { ...adminCookieOptions, maxAge: SESSION_SECONDS });
    return response;
  } catch (error) { return errorResponse(error); }
}
