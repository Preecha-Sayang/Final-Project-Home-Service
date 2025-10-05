import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

type ServiceOption = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string;
    unit_price: string;
    service_name: string;
};

type ApiResponse = {
    ok: boolean;
    options?: ServiceOption[];
    message?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { serviceId } = req.query;

    if (!serviceId || Array.isArray(serviceId)) {
        return res.status(400).json({ ok: false, message: "Invalid serviceId parameter" });
    }

    const id = Number(serviceId);
    if (Number.isNaN(id)) {
        return res.status(400).json({ ok: false, message: "Invalid serviceId format" });
    }

    // สร้าง connection pool
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // ดึงข้อมูล service options พร้อม service name จากตาราง services
        const result = await pool.query(`
            SELECT 
                so.service_option_id, 
                so.service_id, 
                so.name, 
                so.unit, 
                so.unit_price,
                s.servicename as service_name
            FROM service_option so
            INNER JOIN services s ON so.service_id = s.service_id
            WHERE so.service_id = $1
            ORDER BY so.service_option_id ASC
        `, [id]);

        const options = result.rows as ServiceOption[];

        return res.status(200).json({ 
            ok: true, 
            options: options 
        });

    } catch (error) {
        console.error("Error fetching service options:", error);
        return res.status(500).json({ 
            ok: false, 
            message: "Internal server error" 
        });
    } finally {
        // ปิด connection pool
        await pool.end();
    }
}

/**
 * API Endpoint: /api/service-detail-options
 * 
 * ใช้สำหรับดึงข้อมูล service options สำหรับหน้า service detail
 * 
 * Query Parameters:
 * - serviceId: number (required) - ID ของ service ที่ต้องการดึง options
 * 
 * Response Format:
 * {
 *   "ok": true,
 *   "options": [
 *     {
 *       "service_option_id": 1,
 *       "service_id": 1,
 *       "name": "9,000 - 18,000 BTU, แบบติดผนัง",
 *       "unit": "เครื่อง",
 *       "unit_price": "800.00",
 *       "service_name": "ล้างแอร์"
 *     }
 *   ]
 * }
 * 
 * Error Response:
 * {
 *   "ok": false,
 *   "message": "Error message"
 * }
 * 
 * ตัวอย่างการใช้งาน:
 * GET /api/service-detail-options?serviceId=1
 */
