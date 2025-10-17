// จัดการ รายละเอียด/option ของบริการ
import type { NextApiRequest, NextApiResponse } from "next";
import { withAdminAuth, AdminJwt } from "lib/server/withAdminAuth";
// import client DB ของคุณตามจริง

export interface AdminRequest extends NextApiRequest {
    admin: AdminJwt;
}

async function handler(req: AdminRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    // draft: เก็บโครง payload ไว้ก่อน (ยังไม่ใช้จริง)
    const {
        serviceId: _serviceId,
        name: _name,
        price: _price,
        unit: _unit,
    } = req.body ?? {};

    console.log("by admin:", req.admin.email);
    // ช่วยให้ไม่ unused + ดูโครง payload ตอน dev
    console.log("draft payload:", {
        serviceId: _serviceId,
        name: _name,
        price: _price,
        unit: _unit,
    });

    // await client.query(
    //   `INSERT INTO service_options (service_id, name, price, unit) VALUES ($1,$2,$3,$4)`,
    //   [_serviceId, String(_name).trim(), Number(_price), String(_unit).trim()]
    // );

    return res.json({ ok: true });
}

export default withAdminAuth<AdminRequest>(handler, ["superadmin", "manager", "staff"]);

//เดี่ยวมาทำต่อ Draft เอาไว้ก่อน**
// หน้าที่หลัก: วางโครงสำหรับเพิ่ม ตัวเลือกบริการ (service_options) แต่ยังไม่เชื่อม DB จริง
// ตอนนี้แค่ console.log ข้อมูล และ return { ok: true }
// จำกัดสิทธิ์: ["superadmin", "manager", "staff"]
// อยู่ในสถานะ Draft
