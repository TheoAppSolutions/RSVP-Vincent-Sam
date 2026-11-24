import { isAdmin } from "@/lib/admin-auth";
import { json } from "@/lib/http";
import { RSVPS } from "@/lib/rsvps";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  return json({ rsvps: RSVPS });
}
