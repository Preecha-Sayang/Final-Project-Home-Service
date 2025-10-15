import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Files, Fields, File } from "formidable";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import { neon } from "@neondatabase/serverless";

//  export const config = { api: { bodyParser: false } };

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
    if (req.method !== "POST") return res.status(405).end();

    try {
        const { fields, files } = await parseForm(req);

        // รับฟิลด์จาก form
        const servicename = (Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename)?.toString().trim();
        const category_id = Number(Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id);
        const price = Number(Array.isArray(fields.price) ? fields.price[0] : fields.price);
        const description = (Array.isArray(fields.description) ? fields.description[0] : fields.description)?.toString() || null;
        const admin_id = Number(Array.isArray(fields.admin_id) ? fields.admin_id[0] : fields.admin_id);

        if (!servicename || Number.isNaN(category_id) || Number.isNaN(admin_id)) {
            return res.status(400).json({ ok: false, message: "servicename/category_id/admin_id is required." });
        }

        // ถ้ามีไฟล์ภาพ
        const file: File | undefined = Array.isArray(files.file)
            ? (files.file[0] as File | undefined)
            : (files.file as File | undefined);

        let image_url: string | null = null;
        let image_public_id: string | null = null;

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

        // INSERT ลง Neon
        const rows = await sql/*sql*/`
            INSERT INTO services (servicename, category_id, image_url, image_public_id, price, description, admin_id, update_at)
            VALUES (${servicename}, ${category_id}, ${image_url}, ${image_public_id}, ${Number.isFinite(price) ? price : null}, ${description}, ${admin_id}, now())
            RETURNING service_id, servicename, category_id, image_url, image_public_id, price, description, create_at, update_at, admin_id
        `;

        return res.status(200).json({ ok: true, service: rows[0] });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(message);
        return res.status(500).json({ ok: false, message });
    }
}