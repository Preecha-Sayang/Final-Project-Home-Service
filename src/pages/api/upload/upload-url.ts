// เอาไว้อัปโหลดอย่างเดียว
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

async function fileToDataURI(file: Blob, mime: string) {
    const buf = Buffer.from(await file.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
}

// export const config = { api: { bodyParser: false } };
type RequestWithFormData = NextApiRequest & {
    formData?: () => Promise<FormData>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, message: "Method not allowed." });
    }

    try {
        const reqWithFD = req as RequestWithFormData;
        if (typeof reqWithFD.formData !== "function") {
            return res.status(400).json({ ok: false, message: "No form data" });
        }
        const form = await reqWithFD.formData();
        const file = form.get("file") as File | null;
        if (!file) {
            return res.status(400).json({ ok: false, message: "No file" });
        }
        const dataURL = await fileToDataURI(file, file.type || "image/jpeg");
        const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
        const up = await cloudinary.uploader.upload(dataURL, {
            folder,
            resource_type: "image",
        });

        return res.status(200).json({
            ok: true,
            cloudinary: {
                public_id: up.public_id,
                url: up.secure_url,
                width: up.width,
                height: up.height,
                format: up.format,
            },
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ ok: false, message: message || "Upload failed." });
    }
}

// อัปโหลดขึ้น Cloudinary อย่างเดียว แล้ว ส่งลิงก์กลับ (ไม่ได้ยุ่ง DB)