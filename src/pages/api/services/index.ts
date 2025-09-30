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
                SELECT s.service_id, s.servicename, s.category_id,
                    c.name AS category_name,
                    c.bg_color_hex  AS category_bg,
                    c.text_color_hex AS category_text,
                    c.ring_color_hex AS category_ring,
                    s.image_url, s.image_public_id, s.price, s.description,
                    s.create_at, s.update_at, s.admin_id
                FROM services s
                LEFT JOIN service_categories c ON c.category_id = s.category_id
                ORDER BY s.service_id DESC
            `;
            return res.status(200).json({ ok: true, services: rows });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Get services failed" });
        }
    }

    if (req.method === "POST") {
        try {
            const { fields, files } = await parseForm(req);

            const servicename = String(
                Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename || ""
            ).trim();
            const category_id = Number(Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id);
            const admin_id = Number(Array.isArray(fields.admin_id) ? fields.admin_id[0] : fields.admin_id);
            const price =
                fields.price != null ? Number(Array.isArray(fields.price) ? fields.price[0] : fields.price) : null;
            const description = (Array.isArray(fields.description) ? fields.description[0] : fields.description)?.toString() || null;

            if (!servicename || Number.isNaN(category_id) || Number.isNaN(admin_id)) {
                return res.status(400).json({ ok: false, message: "servicename/category_id/admin_id required" });
            }

            let image_url: string | null = null;
            let image_public_id: string | null = null;

            const file: File | undefined = Array.isArray(files.file)
                ? (files.file[0] as File | undefined)
                : (files.file as File | undefined);

            if (file) {
                const f = file as File & { filepath?: string; path?: string; mimetype?: string; type?: string };
                const filepath = f.filepath ?? f.path;
                if (!filepath) throw new Error("Uploaded file has no path");

                const data = await fs.readFile(filepath);
                const mime = f.mimetype ?? f.type ?? "application/octet-stream";
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
                VALUES (${servicename}, ${category_id}, ${image_url}, ${image_public_id},
                        ${Number.isFinite(Number(price)) ? price : null}, ${description}, ${admin_id}, now())
                RETURNING *
            `;

            const service = rows[0];
            const subRaw = Array.isArray(fields.subItems) ? fields.subItems[0] : fields.subItems;
            if (subRaw) {
                const parsed = JSON.parse(String(subRaw)) as Array<{ name: string; unitName: string; price: number; index: number }>;
                for (const it of parsed) {
                    if (!it?.name?.trim()) continue;
                    await sql/*sql*/`
                        INSERT INTO service_option (service_id, name, unit, unit_price)
                        VALUES (${service.service_id}, ${it.name.trim()}, ${it.unitName?.trim() || null}, ${isFinite(Number(it.price)) ? it.price : null})
                    `;
                }
            }

            return res.status(200).json({ ok: true, service: rows[0] });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Create failed" });
        }
    }

    return res.status(405).end();
}