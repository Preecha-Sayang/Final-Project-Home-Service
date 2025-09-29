import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs/promises";
import { sql } from "lib/db";
import { cloudinary } from "lib/server/upload/cloudinary";
import { parseForm, formConfig } from "lib/server/upload/parseForm";
import type { File } from "formidable";

export const config = formConfig;

type ServiceRowDB = {
    servicename: string;
    category_id: number;
    price: number | null;
    description: string | null;
    image_url: string | null;
    image_public_id: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid id." });

    // ดึงข้อมูลตาม id
    if (req.method === "GET") {
        try {
            const rows = await sql/*sql*/`
                SELECT s.*,
                    c.name AS category_name,
                    c.bg_color_hex  AS category_bg,
                    c.text_color_hex AS category_text,
                    c.ring_color_hex AS category_ring
                FROM services s
                LEFT JOIN service_categories c ON c.category_id = s.category_id
                WHERE s.service_id = ${id}
            `;
            if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
            return res.status(200).json({ ok: true, service: rows[0] });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Get failed" });
        }
    }

    // อัปเดตข้อมูลที่เปลี่ยนแปลง
    if (req.method === "PATCH") {
        try {
            const current = await sql/*sql*/`SELECT * FROM services WHERE service_id = ${id}`;
            if (current.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
            const old = current[0] as ServiceRowDB;

            const { fields, files } = await parseForm(req);

            const servicename =
                (Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename)?.toString().trim() ??
                old.servicename;

            const category_id_raw = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
            const category_id = category_id_raw != null ? Number(category_id_raw) : old.category_id;

            const price_raw = Array.isArray(fields.price) ? fields.price[0] : fields.price;
            const price = price_raw != null ? Number(price_raw) : old.price;

            const description =
                ((Array.isArray(fields.description) ? fields.description[0] : fields.description) as string | undefined) ??
                old.description;

            // ลบรูป
            const remove_image_raw = Array.isArray(fields.remove_image) ? fields.remove_image[0] : fields.remove_image;
            const remove_image = String(remove_image_raw ?? "").trim() === "1";

            const file: File | undefined = Array.isArray(files.file)
                ? (files.file[0] as File | undefined)
                : (files.file as File | undefined);

            // 1) เพิ่มรูป > อัปโหลด + อัปเดตลง image_url / image_public_id
            if (file) {
                const f = file as File & { filepath?: string; path?: string; mimetype?: string; type?: string };
                const filepath = f.filepath ?? f.path;
                if (!filepath) throw new Error("Uploaded file has no path.");

                const data = await fs.readFile(filepath);
                const mime = f.mimetype ?? f.type ?? "application/octet-stream";
                const dataURL = `data:${mime};base64,${data.toString("base64")}`;

                const up = await cloudinary.uploader.upload(dataURL, {
                    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
                    resource_type: "image",
                });

                const new_url = up.secure_url;
                const new_public = up.public_id;

                const rows = await sql/*sql*/`
                    UPDATE services
                    SET servicename = ${servicename},
                        category_id = ${category_id},
                        price = ${Number.isFinite(Number(price)) ? price : null},
                        description = ${description},
                        image_url = ${new_url},
                        image_public_id = ${new_public},
                        update_at = now()
                    WHERE service_id = ${id}
                    RETURNING *
                `;

                // ลบรูปเก่าออกจาก Cloudinary ถ้าอัปโหลดใหม่สำเร็จ
                if (old.image_public_id && old.image_public_id !== new_public) {
                    try { await cloudinary.uploader.destroy(old.image_public_id); } catch { /* ignore */ }
                }

                return res.status(200).json({ ok: true, service: rows[0] });
            }

            // 2) ไม่มีไฟล์ใหม่ + ขอ "ลบรูป"
            if (remove_image && old.image_public_id) {
                try { await cloudinary.uploader.destroy(old.image_public_id); } catch { /* ignore */ }
            }

            const rows = await sql/*sql*/`
                UPDATE services
                SET servicename = ${servicename},
                    category_id = ${category_id},
                    price = ${Number.isFinite(Number(price)) ? price : null},
                    description = ${description},
                    image_url = ${remove_image ? null : old.image_url},
                    image_public_id = ${remove_image ? null : old.image_public_id},
                    update_at = now()
                WHERE service_id = ${id}
                RETURNING *
            `;

            return res.status(200).json({ ok: true, service: rows[0] });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Update failed." });
        }
    }

    // ลบรูป
    if (req.method === "DELETE") {
        try {
            const current = await sql/*sql*/`
                SELECT image_public_id
                FROM services
                WHERE service_id = ${id}
            `;
            if (current.length === 0) return res.status(404).json({ ok: false, message: "Not found." });

            const oldPub = (current[0]?.image_public_id as string | null) ?? null;

            await sql/*sql*/`
                DELETE FROM services
                WHERE service_id = ${id}
            `;

            if (oldPub) {
                try { await cloudinary.uploader.destroy(oldPub); } catch { /* ignore */ }
            }

            return res.status(200).json({ ok: true });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Delete failed." });
        }
    }

    return res.status(405).end();
}
