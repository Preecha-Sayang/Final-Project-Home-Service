import type { NextApiRequest, NextApiResponse } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
import { query } from "lib/db";

// API endpoint สำหรับเปลี่ยนสถานะความพร้อมให้บริการของช่างเท่านั้น โดยไม่ต้องส่งข้อมูลโปรไฟล์ทั้งหมด

type MyReq = NextApiRequest & { admin: AdminJwt };

// Response type เมื่อสำเร็จ
type Ok = { ok: true; is_available: boolean };

// Response type เมื่อเกิด error
type Err = { ok: false; message?: string };

// ฟังก์ชันแปลงค่าเป็น boolean
function parseBoolean(input: unknown): boolean | null {
  if (typeof input === "boolean") return input;
  return null;
}

// ฟังก์ชันหลักสำหรับจัดการ API request
async function handler(req: MyReq, res: NextApiResponse<Ok | Err>) {
  // ดึง ID ของช่างจาก token
  const techId = Number(req.admin.adminId);
  if (!Number.isFinite(techId)) return res.status(401).json({ ok: false, message: "invalid token" });

  // ตรวจสอบ HTTP method ต้องเป็น POST เท่านั้น
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  // แปลงข้อมูลจาก request body
  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const parsed = parseBoolean(body.is_available);
  if (parsed == null) {
    return res.status(400).json({ ok: false, message: "is_available must be boolean" });
  }

  const is_available = Boolean(parsed);

  try {
    // อัปเดตเฉพาะสถานะความพร้อมให้บริการ หากมีข้อมูลอยู่แล้วจะคงข้อมูลอื่นไว้
    await query(
      `INSERT INTO public.technician_profiles (admin_id, first_name, last_name, phone, is_available, service_ids, update_at)
       VALUES ($1, NULL, NULL, NULL, $2, '[]'::jsonb, now())
       ON CONFLICT (admin_id)
       DO UPDATE SET is_available = EXCLUDED.is_available,
                     update_at    = now()`,
      [techId, is_available]
    );

    // ส่งผลลัพธ์สำเร็จกลับไป
    return res.json({ ok: true, is_available });
  } catch (e) {
    // จัดการ error และส่งข้อความกลับไป
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ ok: false, message: String(e) });
    }
    return res.status(500).json({ ok: false });
  }
}

// Export handler พร้อม authentication middleware สำหรับ role ที่อนุญาต
export default withAdminAuth<MyReq>(handler, ["technician", "admin", "manager", "superadmin"]);
