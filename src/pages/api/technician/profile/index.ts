import type { NextApiRequest, NextApiResponse } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

/** Types aligned with technician/location API */
type MyReq = NextApiRequest & { admin: AdminJwt };

type OkGet = { ok: true; profile: {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  address_text: string;
  address_meta: unknown;
  is_available: boolean;
  service_ids: number[];
} };

type OkPost = { ok: true };

type Err = { ok: false; message?: string };

type LocationRow = { lat: number; lng: number; address_text: string; address_meta: unknown } | undefined;

type ProfileRow = { is_available: boolean; service_ids: unknown; first_name: string | null; last_name: string | null; phone: string | null } | undefined;

async function q<T>(sqlText: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await query(sqlText, params as unknown[]);
  return rows as T[];
}

function toIntArray(val: unknown): number[] {
  if (!Array.isArray(val)) return [];
  const out: number[] = [];
  for (const v of val) {
    const n = Number(v);
    if (Number.isInteger(n) && n > 0) out.push(n);
  }
  return Array.from(new Set(out));
}

async function handler(req: MyReq, res: NextApiResponse<OkGet | OkPost | Err>) {
  const techId = Number(req.admin.adminId);
  if (!Number.isFinite(techId)) return res.status(401).json({ ok: false, message: "invalid token" });

  if (req.method === "GET") {
    // Minimal data fetch in parallel
    const [adminRows, locRows, profRows] = await Promise.all([
      q<{ name: string }>(`SELECT name FROM public.admin WHERE admin_id = $1`, [techId]),
      q<LocationRow extends undefined ? never : NonNullable<LocationRow>>(
        `SELECT lat, lng, address_text, address_meta FROM public.technician_locations WHERE admin_id = $1 LIMIT 1`,
        [techId]
      ),
      q<NonNullable<ProfileRow>>(
        `SELECT is_available, service_ids, first_name, last_name, phone FROM public.technician_profiles WHERE admin_id = $1 LIMIT 1`,
        [techId]
      ),
    ]);

    const name = adminRows[0]?.name ?? "";
    const loc = (locRows as unknown as any[])[0] as LocationRow;
    const prof = (profRows as unknown as any[])[0] as ProfileRow;

    const profile = {
      name,
      first_name: prof?.first_name ?? null,
      last_name: prof?.last_name ?? null,
      phone: prof?.phone ?? null,
      lat: loc?.lat ?? null,
      lng: loc?.lng ?? null,
      address_text: loc?.address_text ?? "",
      address_meta: loc?.address_meta ?? null,
      is_available: prof?.is_available ?? true,
      service_ids: toIntArray(prof?.service_ids),
    };

    return res.json({ ok: true, profile });
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const name = (body.name ?? "").toString().trim().slice(0, 100); // legacy support
    const first_name = (body.first_name ?? "").toString().trim().slice(0, 100);
    const last_name = (body.last_name ?? "").toString().trim().slice(0, 100);
    const phone = (body.phone ?? "").toString().trim().slice(0, 50);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const address_text = (body.address_text ?? "").toString().trim();
    const meta = body.meta ?? body.address_meta ?? null; // accept both, prefer meta (same as location API)
    const is_available = Boolean(body.is_available);
    const service_ids = toIntArray(body.service_ids);

    // Basic validation (follow location style)
    if (
      typeof lat !== "number" || Number.isNaN(lat) ||
      typeof lng !== "number" || Number.isNaN(lng) ||
      typeof address_text !== "string" || !address_text
    ) {
      return res.status(400).json({ ok: false, message: "invalid payload" });
    }

    // Validate service_ids against services table if any provided
    if (service_ids.length > 0) {
      const valid = await q<{ service_id: number }>(
        `SELECT service_id FROM public.services WHERE service_id = ANY($1::int[])`,
        [service_ids]
      );
      if (valid.length !== service_ids.length) {
        return res.status(400).json({ ok: false, message: "Some service_ids are invalid" });
      }
    }

    try {
      await query("BEGIN");

      // Upsert location (meta -> address_meta)
      await query(
        `INSERT INTO public.technician_locations (admin_id, lat, lng, address_text, address_meta)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (admin_id)
         DO UPDATE SET lat = EXCLUDED.lat,
                       lng = EXCLUDED.lng,
                       address_text = EXCLUDED.address_text,
                       address_meta = EXCLUDED.address_meta,
                       updated_at   = now()`,
        [techId, lat, lng, address_text, meta == null ? null : meta]
      );

      // Upsert technician profile (availability + services + contacts)
      await query(
        `INSERT INTO public.technician_profiles (admin_id, first_name, last_name, phone, is_available, service_ids, update_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())
         ON CONFLICT (admin_id)
         DO UPDATE SET first_name  = EXCLUDED.first_name,
                       last_name   = EXCLUDED.last_name,
                       phone       = EXCLUDED.phone,
                       is_available = EXCLUDED.is_available,
                       service_ids  = EXCLUDED.service_ids,
                       update_at    = now()`,
        [techId, first_name || null, last_name || null, phone || null, is_available, JSON.stringify(service_ids)]
      );

      await query("COMMIT");
      return res.json({ ok: true });
    } catch (e) {
      try { await query("ROLLBACK"); } catch {}
      if (process.env.NODE_ENV !== "production") {
        return res.status(500).json({ ok: false, message: String(e) });
      }
      return res.status(500).json({ ok: false });
    }
  }

  return res.status(405).end();
}

export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);
