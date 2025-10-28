import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

export const config = { api: { bodyParser: false } };

// ชนิดข้อมูลแถวที่ดึงจาก technician_locations
type TechLocationRow = {
    user_id: number;
    lat: number | null;
    lng: number | null;
    updated_at: string | Date;
    source: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
    });
    res.write("\n");

    let timer: NodeJS.Timeout | null = null;

    async function push() {
        const rows = await sql/*sql*/`
            SELECT user_id, lat, lng, updated_at, source
            FROM technician_locations
            ORDER BY updated_at DESC
            LIMIT 100
            ` as TechLocationRow[];

        res.write(`data: ${JSON.stringify({ type: "tech_locations", items: rows })}\n\n`);
    }

    await push();
    timer = setInterval(push, 4000);

    req.on("close", () => { if (timer) clearInterval(timer); });
}
