import { getSupabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin-auth";
import { errorResponse, HttpError, isRecord, json, readJson, requireSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  try {
    const rsvps = [];
    const pageSize = 500;
    // Fetch only the fields used by the dashboard and exports.
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await getSupabase().from("vincent_sam")
        .select("id,name,message,attending,created_at")
        .order("created_at", { ascending: false }).order("id", { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      rsvps.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
    }
    return json({ rsvps });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  try {
    requireSameOrigin(req);
    const body = await readJson(req, 1024);
    if (!isRecord(body) || typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) {
      throw new HttpError(400, "Invalid RSVP id");
    }
    const { data, error } = await getSupabase().from("vincent_sam").delete().eq("id", body.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return json({ error: "RSVP not found" }, 404);
    return json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
