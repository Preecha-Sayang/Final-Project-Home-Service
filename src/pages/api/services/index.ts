import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs/promises";
import { sql } from "lib/db";
import { cloudinary } from "lib/server/upload/cloudinary";
import { parseForm, formConfig } from "lib/server/upload/parseForm";
import type { File } from "formidable";

export const config = formConfig;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            // JOIN เอาชื่อหมวดหมู่มาด้วย
            const rows = await sql/*sql*/`
                SELECT s.service_id, s.servicename, s.category_id, c.name AS category_name,
                    s.image_url, s.image_public_id, s.price, s.description,
                    s.create_at, s.update_at, s.admin_id
                FROM services s
                LEFT JOIN service_categories c ON c.category_id = s.category_id
                ORDER BY s.service_id DESC
            `;
            return res.status(200).json({ ok: true, services: rows });
        } catch (e: any) {
            return res.status(500).json({ ok: false, message: e?.message || "Get services failed" });
        }
    }

    if (req.method === "POST") {
        try {
            const { fields, files } = await parseForm(req);

            const servicename = String(Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename || "").trim();
            const category_id = Number(Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id);
            const admin_id = Number(Array.isArray(fields.admin_id) ? fields.admin_id[0] : fields.admin_id);
            const price = fields.price != null ? Number(Array.isArray(fields.price) ? fields.price[0] : fields.price) : null;
            const description = (Array.isArray(fields.description) ? fields.description[0] : fields.description)?.toString() || null;

            if (!servicename || Number.isNaN(category_id) || Number.isNaN(admin_id)) {
                return res.status(400).json({ ok: false, message: "servicename/category_id/admin_id required" });
            }

            let image_url: string | null = null;
            let image_public_id: string | null = null;

            const file = (Array.isArray(files.file) ? files.file[0] : (files.file as File | undefined));
            if (file) {
                const filepath = (file as any).filepath || (file as any).path;
                const data = await fs.readFile(filepath);
                const mime = file.mimetype || "application/octet-stream";
                const dataURL = `data:${mime};base64,${data.toString("base64")}`;
                const up = await cloudinary.uploader.upload(dataURL, {
                    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
                    resource_type: "image",
                });
                image_url = up.secure_url;
                image_public_id = up.public_id;
            }

            const rows = await sql/*sql*/`
                INSERT INTO services (servicename, category_id, image_url, image_public_id, price, description, admin_id, update_at)
                VALUES (${servicename}, ${category_id}, ${image_url}, ${image_public_id}, ${isFinite(Number(price)) ? price : null}, ${description}, ${admin_id}, now())
                RETURNING *
            `;
            return res.status(200).json({ ok: true, service: rows[0] });
        } catch (e: any) {
            console.error(e);
            return res.status(500).json({ ok: false, message: e?.message || "Create failed" });
        }
    }

    return res.status(405).end();
}