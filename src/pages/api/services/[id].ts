// src/pages/api/services/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs/promises";
import { sql } from "lib/db";
import { cloudinary } from "lib/server/upload/cloudinary";
import { parseForm } from "lib/server/upload/parseForm";
import type { File } from "formidable";

//ถ้าลบบรรทัดนี้จะไม่สามารถสร้างบริการได้
export const config = { api: { bodyParser: false as const } };

type ServiceRowDB = {
    servicename: string;
    category_id: number;
    price: string | null;
    description: string | null;
    image_url: string | null;
    image_public_id: string | null;
};

type ServiceRowJoined = {
    service_id: number;
    servicename: string;
    category_id: number;
    image_url: string | null;
    image_public_id: string | null;
    price: string | null;
    description: string | null;
    create_at: string;
    update_at: string;
    admin_id: number;

    category_name: string | null;
    category_bg: string | null;
    category_text: string | null;
    category_ring: string | null;
};

type OkGet = { ok: true; service: ServiceRowJoined };
type OkMut = { ok: true; service: ServiceRowJoined };
type OkDel = { ok: true };
type Err = {
    ok: false;
    message?: string;
    code?: "IN_USE" | string;
    count?: number;
    technicians?: string[];
};
type ErrInUse = {
    ok: false;
    code: "IN_USE";
    count: number;
    technicians: string[];
    message: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<OkGet | OkMut | OkDel | Err | ErrInUse>
) {
    const id = Number(req.query.id);
    if (!id || Number.isNaN(id)) {
        return res.status(400).json({ ok: false, message: "Invalid id." });
    }

    // GET
    if (req.method === "GET") {
        try {
            const rowsU = await sql/*sql*/`
        SELECT s.*,
               c.name           AS category_name,
               c.bg_color_hex   AS category_bg,
               c.text_color_hex AS category_text,
               c.ring_color_hex AS category_ring
        FROM services s
        LEFT JOIN service_categories c ON c.category_id = s.category_id
        WHERE s.service_id = ${id}
      `;
            const rows = rowsU as unknown as ServiceRowJoined[];
            if (rows.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
            return res.status(200).json({ ok: true, service: rows[0] });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Get failed" });
        }
    }

    // PATCH (อัปเดตฟิลด์ + รูป)
    if (req.method === "PATCH") {
        try {
            const currentU = await sql/*sql*/`SELECT * FROM services WHERE service_id = ${id}`;
            const current = currentU as unknown as ServiceRowDB[];
            if (current.length === 0) return res.status(404).json({ ok: false, message: "Not found." });
            const old = current[0];

            const { fields, files } = await parseForm(req);

            const newNameRaw = Array.isArray(fields.servicename) ? fields.servicename[0] : fields.servicename;
            const servicename = (newNameRaw ?? old.servicename).toString().trim();

            const catRaw = Array.isArray(fields.category_id) ? fields.category_id[0] : fields.category_id;
            const category_id = catRaw != null ? Number(catRaw) : old.category_id;

            const priceRaw = Array.isArray(fields.price) ? fields.price[0] : fields.price;
            const price = priceRaw != null ? Number(priceRaw) : (old.price != null ? Number(old.price) : null);

            const descRaw = Array.isArray(fields.description) ? fields.description[0] : fields.description;
            const description = (descRaw as string | null | undefined) ?? old.description;

            const removeRaw = Array.isArray(fields.remove_image) ? fields.remove_image[0] : fields.remove_image;
            const remove_image = String(removeRaw ?? "").trim() === "1";

            const fileF =
                (Array.isArray(files.file) ? files.file[0] : files.file) as
                | (File & { filepath?: string; path?: string; mimetype?: string; type?: string })
                | undefined;

            // 1) อัปโหลดรูปใหม่ถ้ามี
            if (fileF) {
                const filepath = fileF.filepath ?? fileF.path;
                if (!filepath) throw new Error("Uploaded file has no path.");

                const data = await fs.readFile(filepath);
                const mime = fileF.mimetype ?? fileF.type ?? "application/octet-stream";
                const dataURL = `data:${mime};base64,${data.toString("base64")}`;

                const up = await cloudinary.uploader.upload(dataURL, {
                    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
                    resource_type: "image",
                });

                const new_url = up.secure_url;
                const new_public = up.public_id;

                const updatedU = await sql/*sql*/`
          UPDATE services
             SET servicename     = ${servicename},
                 category_id     = ${category_id},
                 price           = ${Number.isFinite(Number(price)) ? price : null},
                 description     = ${description},
                 image_url       = ${new_url},
                 image_public_id = ${new_public},
                 update_at       = now()
           WHERE service_id      = ${id}
           RETURNING *
        `;
                const updated = updatedU as unknown as ServiceRowJoined[];

                if (old.image_public_id && old.image_public_id !== new_public) {
                    try { await cloudinary.uploader.destroy(old.image_public_id); } catch { /* noop */ }
                }

                return res.status(200).json({ ok: true, service: updated[0] });
            }

            // 2) ไม่มีไฟล์ใหม่ เช็ค remove_image
            if (remove_image && old.image_public_id) {
                try { await cloudinary.uploader.destroy(old.image_public_id); } catch { /* noop */ }
            }

            const updatedU = await sql/*sql*/`
        UPDATE services
           SET servicename     = ${servicename},
               category_id     = ${category_id},
               price           = ${Number.isFinite(Number(price)) ? price : null},
               description     = ${description},
               image_url       = ${remove_image ? null : old.image_url},
               image_public_id = ${remove_image ? null : old.image_public_id},
               update_at       = now()
         WHERE service_id      = ${id}
         RETURNING *
      `;
            const updated = updatedU as unknown as ServiceRowJoined[];
            return res.status(200).json({ ok: true, service: updated[0] });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Update failed." });
        }
    }

    // DELETE — วิธี A: บล็อกการลบถ้ามีการใช้งาน
    if (req.method === "DELETE") {
        try {
            // 0) มี service นี้ไหม + เก็บ public_id ไว้ลบรูปถ้าลบสำเร็จ
            const curU = await sql/*sql*/`
        SELECT image_public_id 
          FROM services 
         WHERE service_id = ${id}
      `;
            const cur = curU as unknown as { image_public_id: string | null }[];
            if (cur.length === 0) return res.status(404).json({ ok: false, message: "Not found" });
            const oldPub = cur[0]?.image_public_id ?? null;

            // 1) เช็กการใช้งาน: มี booking_item อ้างถึง service_option ของ service นี้หรือไม่
            const inUseU = await sql/*sql*/`
  SELECT COUNT(*)::int AS cnt
  FROM booking_item bi
  JOIN service_option so ON so.service_option_id = bi.service_option_id
  WHERE so.service_id = ${id}
`;
            const inUse = (inUseU as unknown as { cnt: number }[])[0]?.cnt ?? 0;

            if (inUse > 0) {
                const techU = await sql/*sql*/`
                    SELECT DISTINCT a.name
                    FROM booking_item bi
                    JOIN service_option so ON so.service_option_id = bi.service_option_id
                    JOIN booking b         ON b.booking_id = bi.booking_id
                    LEFT JOIN admin a      ON a.admin_id = b.admin_id
                    WHERE so.service_id = ${id} AND b.admin_id IS NOT NULL
                    LIMIT 10
                `;
                const technicians = (techU as unknown as { name: string | null }[])
                    .map(r => r.name)
                    .filter(Boolean) as string[];

                return res.status(409).json({
                    ok: false,
                    code: "IN_USE",
                    count: inUse,
                    technicians,
                    message: `ลบไม่ได้ มีรายการจอง ${inUse} รายการที่ยังอ้างอิงบริการนี้`,
                });
            }

            // 2) ไม่มีการใช้งาน → ลบได้ (ลบ options ก่อน กัน FK)
            await sql/*sql*/`BEGIN`;
            await sql/*sql*/`DELETE FROM service_option WHERE service_id = ${id}`;
            await sql/*sql*/`DELETE FROM services WHERE service_id = ${id}`;
            await sql/*sql*/`COMMIT`;

            // 3) ลบรูปบน Cloudinary ถ้ามี
            if (oldPub) {
                try { await cloudinary.uploader.destroy(oldPub); } catch { /* noop */ }
            }

            return res.status(200).json({ ok: true });
        } catch (e: unknown) {
            try { await sql/*sql*/`ROLLBACK`; } catch { /* noop */ }
            const message = e instanceof Error ? e.message : String(e);
            return res.status(500).json({ ok: false, message: message || "Delete failed." });
        }
    }

    return res.status(405).end();
}