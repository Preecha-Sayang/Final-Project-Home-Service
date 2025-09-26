// สำรหรับอัปเดต Cloudinary (ภาพใหม่) //หน้าแก้ไขบริการ
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Files, Fields, File } from "formidable";
import fs from "node:fs/promises";

import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

export const config = {
    api: { bodyParser: false }, //ทำให้อ่าน multipart
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const sql = neon(process.env.DATABASE_URL!);

// แปลง multipart เป็น fields + files (async/await)
function parseForm(req: NextApiRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({ multiples: false });
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { fields, files } = await parseForm(req);

        // file จาก input
        const file = (Array.isArray(files.file) ? files.file[0] : (files.file as File | undefined));
        if (!file) return res.status(400).json({ ok: false, message: "No file." });

        // เอาไว้ทำเพิ่มทีหลัง
        const serviceIdRaw = Array.isArray(fields.serviceId) ? fields.serviceId[0] : fields.serviceId;
        const serviceId = serviceIdRaw ? Number(serviceIdRaw) : undefined;

        // อ่านไฟล์เป็น buffer
        const filepath = (file as any).filepath || (file as any).path; // รองรับทั้ง v1/v2
        const data = await fs.readFile(filepath);
        const mime = file.mimetype || "application/octet-stream";
        const dataURL = `data:${mime};base64,${data.toString("base64")}`;

        // อัปโหลดขึ้น Cloudinary คืออันนี้
        const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
        const up = await cloudinary.uploader.upload(dataURL, {
            folder,
            resource_type: "image",
        });

        // ถ้ามี serviceId อัปเดต Neon
        let updatedRow: any = null;
        if (typeof serviceId === "number" && !Number.isNaN(serviceId)) {
            const updated = await sql/*sql*/`
                UPDATE services
                SET image_url = ${up.secure_url}
                WHERE service_id = ${serviceId}
                RETURNING service_id, servicename, image_url
            `;
            if (updated.length === 0) {
                return res.status(404).json({ ok: false, message: "Service not found." });
            }
            updatedRow = updated[0];
        }

        return res.status(200).json({
            ok: true,
            cloudinary: {
                public_id: up.public_id,
                url: up.secure_url,
                width: up.width,
                height: up.height,
                format: up.format,
            },
            service: updatedRow,
        });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ ok: false, message: e?.message || "Upload failed." });
    }
} 