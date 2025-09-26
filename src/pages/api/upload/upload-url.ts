// สำหรับสร้างบริการใหม่ แบบไม่ต้องส่ง serviceId
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import formidable, { Files, Fields, File } from "formidable";
import fs from "node:fs/promises";

export const config = {
    api: { bodyParser: false },
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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
        const { files } = await parseForm(req);
        const file = (Array.isArray(files.file) ? files.file[0] : (files.file as File | undefined));
        if (!file) return res.status(400).json({ ok: false, message: "No file." });

        const filepath = (file as any).filepath || (file as any).path;
        const data = await fs.readFile(filepath);
        const mime = file.mimetype || "application/octet-stream";
        const dataURL = `data:${mime};base64,${data.toString("base64")}`;

        const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads";
        const up = await cloudinary.uploader.upload(dataURL, { folder, resource_type: "image" });

        return res.status(200).json({ ok: true, cloudinary: { url: up.secure_url, public_id: up.public_id } });
    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ ok: false, message: e?.message || "Upload failed." });
    }
}