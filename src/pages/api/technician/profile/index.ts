import type { NextApiRequest, NextApiResponse } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

/** Types aligned with technician/location API */
type MyReq = NextApiRequest & { admin: AdminJwt };

type OkGet = {
  ok: true; profile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    lat: number | null;
    lng: number | null;
    address_text: string;
    address_meta: unknown;
    is_available: boolean;
    service_ids: number[];
  }
};

type OkPost = { ok: true };

type Err = { ok: false; message?: string };

/** DB row shapes */
type LocationRowDB = { lat: number | null; lng: number | null; address_text: string | null; address_meta: unknown };

/** ใช้เป็นค่าที่อ่านจาก DB แล้วอาจไม่มีแถว */
type LocationRow = { lat: number; lng: number; address_text: string; address_meta: unknown } | undefined;

type ProfileRowDB = {
  is_available: boolean | null;
  service_ids: unknown;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

type ProfileRow = {
  is_available: boolean;
  service_ids: unknown;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
} | undefined;

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
      q<LocationRowDB>(
        `SELECT lat, lng, address_text, address_meta FROM public.technician_locations WHERE admin_id = $1 LIMIT 1`,
        [techId]
      ),
      q<ProfileRowDB>(
        `SELECT is_available, service_ids, first_name, last_name, phone FROM public.technician_profiles WHERE admin_id = $1 LIMIT 1`,
        [techId]
      ),
    ]);

    const name = adminRows[0]?.name ?? "";

    // แปลง locRows[0] -> LocationRow (หรือ undefined ถ้าขาด/ไม่สมบูรณ์)
    const locDb = locRows[0];
    const loc: LocationRow =
      locDb && typeof locDb.lat === "number" && typeof locDb.lng === "number"
        ? {
          lat: locDb.lat,
          lng: locDb.lng,
          address_text: String(locDb.address_text ?? ""),
          address_meta: locDb.address_meta ?? null,
        }
        : undefined;

    // แปลง profRows[0] -> ProfileRow (ให้มี default ที่เหมาะสม)
    const profDb = profRows[0];
    const prof: ProfileRow = profDb
      ? {
        is_available: Boolean(profDb.is_available ?? true),
        service_ids: profDb.service_ids,
        first_name: profDb.first_name ?? null,
        last_name: profDb.last_name ?? null,
        phone: profDb.phone ?? null,
      }
      : undefined;

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

    const first_name = (body.first_name ?? "").toString().trim().slice(0, 100);
    const last_name = (body.last_name ?? "").toString().trim().slice(0, 100);
    const phone = (body.phone ?? "").toString().trim().slice(0, 50);
    const is_available = Boolean(body.is_available);
    const service_ids = toIntArray(body.service_ids);
    // Get name from body or construct from first_name and last_name
    const name = (body.name ?? [first_name, last_name].filter(Boolean).join(" ").trim()).toString().trim().slice(0, 200);

    // Validate and filter service_ids against services table if any provided
    let validServiceIds: number[] = [];
    if (service_ids.length > 0) {
      try {
        const valid = await q<{ service_id: number }>(
          `SELECT service_id FROM public.services WHERE service_id = ANY($1::int[])`,
          [service_ids]
        );
        validServiceIds = valid.map(v => v.service_id);
        
        // Log warning if some IDs are invalid, but continue with valid ones
        const validIdsSet = new Set(validServiceIds);
        const invalidIds = service_ids.filter(id => !validIdsSet.has(id));
        if (invalidIds.length > 0) {
          console.warn(`Some service_ids are invalid: ${invalidIds.join(", ")}, using only valid ones`);
        }
      } catch (e) {
        console.error("Error validating service_ids:", e);
        // If validation fails, use empty array instead of failing the whole request
        validServiceIds = [];
      }
    }

    try {
      await query("BEGIN");

      // Update admin name if provided
      if (name) {
        await query(
          `UPDATE public.admin SET name = $1 WHERE admin_id = $2`,
          [name, techId]
        );
      }

      // Upsert technician profile (availability + services + contacts)
      // Use validated service_ids instead of original ones
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
        [techId, first_name || null, last_name || null, phone || null, is_available, JSON.stringify(validServiceIds)]
      );

      await query("COMMIT");
      return res.json({ ok: true });
    } catch (e) {
      try { await query("ROLLBACK"); } catch { }
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error saving technician profile:", errorMessage);
      return res.status(500).json({ ok: false, message: errorMessage });
    }
  }

  return res.status(405).end();
}

export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);
