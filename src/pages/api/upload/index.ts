// เอาไว้อัปโหลด + อัปเดต services
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const sql = neon(process.env.DATABASE_URL!);

// helper: แปลง File เป็น imageURI
async function fileToDataURI(file: Blob, mime: string) {
    const buf = Buffer.from(await file.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
}

// export const config = { api: { bodyParser: false } };// ปิด bodyParser เพื่อใช้ FormData เอง
type RequestWithFormData = NextApiRequest & {
    formData?: () => Promise<FormData>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

    try {
        const reqWithFD = req as RequestWithFormData;
        if (typeof reqWithFD.formData !== "function") {
            return res.status(400).json({ ok: false, message: "No form data" });
        }

        const form = await reqWithFD.formData();
        const file = form.get("file") as File | null;
        const serviceIdRaw = form.get("serviceId");
        const serviceId = Number(serviceIdRaw);

        if (!file) {
            return res.status(400).json({ ok: false, message: "No file" });
        }
        if (!serviceId || Number.isNaN(serviceId)) {
            return res.status(400).json({ ok: false, message: "Invalid serviceId" });
        }

        // อ่าน public_id เดิมของ service เพื่อลบทีหลัง
        const rows = await sql/*sql*/`
            SELECT image_public_id 
            FROM services 
            WHERE service_id = ${serviceId} 
            LIMIT 1
        `;
        const oldPublicId: string | null = rows[0]?.image_public_id ?? null;

        // อัปโหลดไป Cloudinary
        const dataURL = await fileToDataURI(file, file.type || "image/jpeg");
        const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";

        const up = await cloudinary.uploader.upload(dataURL, {
            folder,
            resource_type: "image",
        });

        // อัปเดตฐานข้อมูล
        const updated = await sql/*sql*/`
            UPDATE services
            SET image_url = ${up.secure_url},
                image_public_id = ${up.public_id},
                update_at = NOW()
            WHERE service_id = ${serviceId}
            RETURNING service_id, servicename, category_id, image_url, image_public_id, create_at, update_at
        `;

        if (updated.length === 0) {
            // rollback ลบรูปใหม่ทิ้ง (กัน orphan)
            await cloudinary.uploader.destroy(up.public_id).catch(() => { });
            return res.status(404).json({ ok: false, message: "Service not found" });
        }

        // ลบรูปเก่าถ้ามี (ทำหลัง UPDATE สำเร็จ)
        if (oldPublicId && oldPublicId !== up.public_id) {
            cloudinary.uploader.destroy(oldPublicId).catch(() => { });
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
            service: updated[0],
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: message || "Upload failed" });
    }
}

// อัปโหลดขึ้น Cloudinary และ อัปเดตตาราง services (image_url, image_public_id) + ลบรูปเก่า
// เดี๋ยวหาไฟล์ที่ตั้งค่า export const config = { api: { bodyParser: false } } //ปรับเป็น false