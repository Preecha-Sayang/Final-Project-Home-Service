import type { NextApiRequest, NextApiResponse } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

// Only toggle technician availability without requiring full profile payload

type MyReq = NextApiRequest & { admin: AdminJwt };

type Ok = { ok: true; is_available: boolean };

type Err = { ok: false; message?: string };

function parseBoolean(input: unknown): boolean | null {
  if (typeof input === "boolean") return input;
  return null;
}

async function handler(req: MyReq, res: NextApiResponse<Ok | Err>) {
  const techId = Number(req.admin.adminId);
  if (!Number.isFinite(techId)) return res.status(401).json({ ok: false, message: "invalid token" });

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const parsed = parseBoolean(body.is_available);
  if (parsed == null) {
    return res.status(400).json({ ok: false, message: "is_available must be boolean" });
  }

  const is_available = Boolean(parsed);

  try {
    // Upsert only the availability flag. Preserve other profile fields if a row already exists.
    await query(
      `INSERT INTO public.technician_profiles (admin_id, first_name, last_name, phone, is_available, service_ids, update_at)
       VALUES ($1, NULL, NULL, NULL, $2, '[]'::jsonb, now())
       ON CONFLICT (admin_id)
       DO UPDATE SET is_available = EXCLUDED.is_available,
                     update_at    = now()`,
      [techId, is_available]
    );

    return res.json({ ok: true, is_available });
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ ok: false, message: String(e) });
    }
    return res.status(500).json({ ok: false });
  }
}

export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);
