import type { NextApiRequest, NextApiResponse } from "next";
import { sql } from "lib/db";

type AddressRow = { address_id: number } & Record<string, unknown>;

type NewAddressBody = {
    user_id?: number | null;
    label?: string | null;
    place_name?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    country?: string | null;
    lat: number;
    lng: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === "GET") {
            const rows = (await sql/*sql*/`SELECT * FROM addresses ORDER BY address_id DESC LIMIT 100`) as AddressRow[];
            return res.status(200).json({ ok: true, items: rows });
        }

        if (req.method === "POST") {
            const bodyRaw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const body = (bodyRaw ?? {}) as Partial<NewAddressBody>;

            const {
                user_id = null,
                label = null,
                place_name = null,
                address_line1 = null,
                address_line2 = null,
                district = null,
                city = null,
                province = null,
                postal_code = null,
                country = null,
                lat,
                lng,
            } = body;

            if (typeof lat !== "number" || typeof lng !== "number")
                return res.status(400).json({ ok: false, message: "lat/lng required" });

            const rows = (await sql/*sql*/`
                INSERT INTO addresses (user_id,label,place_name,address_line1,address_line2,district,city,province,postal_code,country,lat,lng)
                VALUES (${user_id},${label},${place_name},${address_line1},${address_line2},${district},${city},${province},${postal_code},${country},${lat},${lng})
                RETURNING *
            `) as AddressRow[];

            return res.status(201).json({ ok: true, item: rows[0] });
        }

        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ ok: false, message: "Method Not Allowed" });
    } catch (e: unknown) {
        console.error(e);
        const message = e instanceof Error ? e.message : "Server error";
        return res.status(500).json({ ok: false, message });
    }
}


//# GET/POST
