// PATCH/DELETE (admin only)
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files, File } from "formidable";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

export const config = { api: { bodyParser: false } };

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const sql = neon(process.env.DATABASE_URL!);

function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({ multiples: false });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") return res.status(405).end();

    try {
        const id = Number(req.query.id);
        if (!id || Number.isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid service id." });

        const { fields, files } = await parseForm(req);

        // เอาไว้อ่านแถวเดิม (จะได้ public_id เก่าไว้ลบ)
        const current = await sql/*sql*/`SELECT * FROM services WHERE service_id = ${id}`;
        if (current.length === 0) return res.status(404).json({ ok: false, message: "Service not found." });
        const old = current[0] as any;

        // เอาไว้เตรียมค่าที่จะอัปเดต
        const servicename =
            (Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename)?.toString().trim() ?? old.servicename;

        const category_id_raw = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
        const category_id = category_id_raw != null ? Number(category_id_raw) : old.category_id;

        const price_raw = Array.isArray(fields.price) ? fields.price[0] : fields.price;
        const price = price_raw != null ? Number(price_raw) : old.price;

        const description =
            ((Array.isArray(fields.description) ? fields.description[0] : fields.description) as string | undefined) ??
            old.description;

        let newImageUrl: string | null = old.image_url;
        let newPublicId: string | null = old.image_public_id;

        // เอาไว้เพิ่มไฟล์รูปใหม่ อัปไป Cloudinary
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

            newImageUrl = up.secure_url;
            newPublicId = up.public_id;
        }

        // อัปเดต Database(NEON)
        const updated = await sql/*sql*/`
            UPDATE services
            SET servicename = ${servicename},
                category_id = ${category_id},
                price = ${isFinite(Number(price)) ? price : null},
                description = ${description},
                image_url = ${newImageUrl},
                image_public_id = ${newPublicId},
                update_at = now()
            WHERE service_id = ${id}
            RETURNING service_id, servicename, category_id, image_url, image_public_id, price, description, update_at
        `;

        // เอาไว้เช็ค ถ้ามีรูปใหม่จริง และมีรูปเก่า ให้ลบรูปเก่าทิ้ง
        if (file && old.image_public_id && old.image_public_id !== newPublicId) {
            try { await cloudinary.uploader.destroy(old.image_public_id); } catch (e) { console.warn("destroy old failed.", e); }
        }

        return res.status(200).json({ ok: true, service: updated[0] });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ ok: false, message: e?.message || "Update failed." });
    }
}