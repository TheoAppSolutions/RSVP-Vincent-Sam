import { getSupabase } from "@/lib/supabase";
import { errorResponse, HttpError, isRecord, json, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    if (!isRecord(body) || typeof body.name !== "string" || typeof body.attending !== "boolean"
      || (body.message !== undefined && typeof body.message !== "string")) {
      throw new HttpError(400, "Please provide a valid name and attendance choice.");
    }
    const name = body.name.trim();
    const message = (body.message as string | undefined)?.trim() || null;
    if (!name || body.name.length > 120 || (typeof body.message === "string" && body.message.length > 1000)) {
      throw new HttpError(400, "Name must be 1–120 characters and message at most 1000 characters.");
    }
    const limited = await rateLimit(req, "rsvp");
    if (limited) return limited;
    const { error } = await getSupabase().from("vincent_krystel").insert({
      name, message, attending: body.attending,
    });
    if (error) throw error;
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
