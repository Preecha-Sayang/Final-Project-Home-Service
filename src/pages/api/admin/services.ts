import type { NextApiResponse } from "next";
import { withAdminAuth, AdminRequest } from "@/lib/server/withAdminAuth";
// import pool/client DB ตามจริง

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    const { serviceId, name, price, unit } = req.body ?? {};
    console.log("by admin:", req.admin.email);

    return res.json({ ok: true });
}

export default withAdminAuth<AdminRequest>(handler, ["superadmin", "manager", "staff"]);

//หน้าที่หลัก : แค่ทดสอบว่า admin login ผ่าน withAdminAuth แล้ว request มาถึงได้
//โค้ดนี้เอาไว้เทสเฉยๆ