import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

// ชนิดข้อมูลแถวที่ดึงจาก technician_locations
type TechLocationRow = {
    user_id: number;
    lat: number | null;
    lng: number | null;
    updated_at: string | Date;
    source: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // เฉพาะ SSE: กำหนด header
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // ป้องกัน proxy บางตัวบีบอัด (ทำให้ stream ค้าง)
    res.setHeader("Content-Encoding", "identity");

    // ส่ง header ออกไปทันที
    res.flushHeaders?.();

    // กัน idle timeout บางเคส
    res.socket?.setKeepAlive?.(true);

    let timer: NodeJS.Timeout | null = null;

    async function push() {
        const rows = await sql/*sql*/`
      SELECT user_id, lat, lng, updated_at, source
      FROM technician_locations
      ORDER BY updated_at DESC
      LIMIT 100
    ` as unknown as TechLocationRow[];

        res.write(`data: ${JSON.stringify({ type: "tech_locations", items: rows })}\n\n`);
    }

    // ยิงครั้งแรก แล้วตั้ง interval
    try {
        await push();
        timer = setInterval(push, 4000);
    } catch {
        // ถ้า query พังให้ปิดสตรีม
        clearInterval(timer!);
        res.write(`event: error\ndata: ${JSON.stringify({ message: "query failed" })}\n\n`);
        res.end();
        return;
    }

    // จบเมื่อ client ปิด
    req.on("close", () => {
        if (timer) clearInterval(timer);
        res.end();
    });
}