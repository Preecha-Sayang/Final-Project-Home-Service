import type { NextApiRequest, NextApiResponse } from "next";
import fs from "node:fs/promises";
import { sql } from "lib/db";
import { cloudinary } from "lib/server/upload/cloudinary";
import { parseForm } from "lib/server/upload/parseForm";
import type { File } from "formidable";
import { withAdminAuth, type AdminRequest } from "lib/server/withAdminAuth";

//ถ้าลบบรรทัดนี้จะไม่สามารถสร้างบริการได้ (แกให้ไม่มี as const , saticfies)
export const config = {
    api: {
        bodyParser: false,
    },
};

export type ServiceRow = {
    service_id: number;
    servicename: string;
    category_id: number;

    // service_categories
    category_name: string | null;
    category_bg: string | null;
    category_text: string | null;
    category_ring: string | null;

    image_url: string | null;
    image_public_id: string | null;

    // numeric ของ Postgres
    price: string | null;
    description: string | null;

    create_at: string;
    update_at: string;
    admin_id: number;

    // เพิ่มการจัดอันดับใหม่ตอนลากเสร็จ
    position: number | null;
};

// service_option
export type ServiceOptionRow = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string | null;
    unit_price: string | null;
};

// payload ของ subItems ที่มาจาก form
type SubDraft = {
    name: string;
    unitName: string;
    price: number;
    index: number;
};

/** Response types */
type OkList = { ok: true; services: ServiceRow[] };
type OkCreate = { ok: true; service: ServiceRow; options: ServiceOptionRow[] };
type Err = { ok: false; message?: string };

async function handler(
    req: AdminRequest | NextApiRequest,
    res: NextApiResponse<OkList | OkCreate | Err>
) {
    if (req.method === "GET") {
        try {
            // JOIN เอาชื่อหมวดหมู่ + สี + เรียงตาม position
            const rowsU = await sql/*sql*/`
        SELECT s.service_id, s.servicename, s.category_id,
            c.name AS category_name,
            c.bg_color_hex  AS category_bg,
            c.text_color_hex AS category_text,
            c.ring_color_hex AS category_ring,
            s.image_url, s.image_public_id, s.price, s.description,
            s.create_at, s.update_at, s.admin_id, s.position
        FROM services s
        LEFT JOIN service_categories c ON c.category_id = s.category_id
        ORDER BY s.position ASC NULLS LAST, s.service_id ASC
      `;
            const rows = rowsU as unknown as ServiceRow[];
            return res.status(200).json({ ok: true, services: rows });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return res
                .status(500)
                .json({ ok: false, message: message || "Get services failed." });
        }
    }

    if (req.method === "POST") {
        let uploadedPublicId: string | null = null;

        try {
            // =========================
            // 1) ตรวจคนที่ล็อกอิน -> หา admin_id จากอีเมล
            // =========================
            const adminEmail =
                (req as AdminRequest).admin?.email ?? null; // withAdminAuth จะใส่มาให้
            if (!adminEmail) {
                return res
                    .status(401)
                    .json({ ok: false, message: "Unauthorized (no admin email)" });
            }

            const adminRowsU = await sql/*sql*/`
        SELECT admin_id
        FROM public.admin
        WHERE email = ${adminEmail}
        LIMIT 1
      `;
            const adminRows =
                adminRowsU as unknown as Array<{ admin_id: number }>;
            if (adminRows.length === 0) {
                return res
                    .status(403)
                    .json({ ok: false, message: "You are not admin" });
            }
            const admin_id = adminRows[0].admin_id;

            // =========================
            // 2) อ่านฟอร์ม
            // =========================
            const { fields, files } = await parseForm(req as NextApiRequest);

            const servicename = String(
                Array.isArray(fields.servicename)
                    ? fields.servicename[0]
                    : fields.servicename ?? ""
            ).trim();

            const category_id = Number(
                Array.isArray(fields.category_id)
                    ? fields.category_id[0]
                    : fields.category_id
            );

            // **ไม่รับ admin_id จาก client อีกต่อไป**
            // const admin_id = Number(...)

            const priceField = Array.isArray(fields.price)
                ? fields.price[0]
                : fields.price;
            const priceNumOrNull =
                priceField != null ? Number(priceField) : null;

            const descField = Array.isArray(fields.description)
                ? fields.description[0]
                : fields.description;
            const description = descField != null ? String(descField) : null;

            if (!servicename || Number.isNaN(category_id)) {
                return res.status(400).json({
                    ok: false,
                    message: "servicename/category_id required",
                });
            }

            // Upload รูป
            let image_url: string | null = null;
            let image_public_id: string | null = null;

            const fileF =
                (Array.isArray(files.file) ? files.file[0] : files.file) as
                | (File & {
                    filepath?: string;
                    path?: string;
                    mimetype?: string;
                    type?: string;
                })
                | undefined;

            if (fileF) {
                const filepath = fileF.filepath ?? fileF.path;
                if (!filepath) throw new Error("Uploaded file has no path");

                const data = await fs.readFile(filepath);
                const mime =
                    fileF.mimetype ?? fileF.type ?? "application/octet-stream";
                const dataURL = `data:${mime};base64,${data.toString("base64")}`;

                const up = await cloudinary.uploader.upload(dataURL, {
                    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",
                    resource_type: "image",
                });

                image_url = up.secure_url;
                image_public_id = up.public_id;
                uploadedPublicId = up.public_id; // กัน orphan หาก transaction fail
            }

            // Transaction
            await sql/*sql*/`BEGIN`;

            // 1) INSERT services + Position ต่อท้าย
            const createdRowsU = await sql/*sql*/`
        INSERT INTO services (
          servicename, category_id, image_url, image_public_id, price, description, admin_id, update_at, position
        ) VALUES (
          ${servicename},
          ${category_id},
          ${image_url},
          ${image_public_id},
          ${Number.isFinite(Number(priceNumOrNull)) ? priceNumOrNull : null},
          ${description},
          ${admin_id},
          now(),
          (SELECT COALESCE(MAX(position), 0) + 1 FROM services)
        )
        RETURNING *
      `;
            const createdRows = createdRowsU as unknown as ServiceRow[];
            const service = createdRows[0];

            // 2) INSERT subItems (ถ้ามี)
            const subRaw = Array.isArray(fields.subItems)
                ? fields.subItems[0]
                : fields.subItems;
            if (subRaw) {
                let parsed: SubDraft[] = [];
                try {
                    parsed = JSON.parse(String(subRaw)) as SubDraft[];
                } catch {
                    parsed = [];
                }

                for (const it of parsed) {
                    const nm = (it?.name ?? "").trim();
                    if (!nm) continue;
                    const unitNm = (it?.unitName ?? "").trim() || null;
                    const unitPrice = Number(it?.price);

                    await sql/*sql*/`
            INSERT INTO service_option (service_id, name, unit, unit_price)
            VALUES (${service.service_id}, ${nm}, ${unitNm}, ${Number.isFinite(unitPrice) ? unitPrice : null})
          `;
                }
            }

            // 3) SELECT options ล่าสุดคืนไปด้วย
            const optRowsU = await sql/*sql*/`
        SELECT service_option_id, service_id, name, unit, unit_price
        FROM service_option
        WHERE service_id = ${service.service_id}
        ORDER BY service_option_id ASC
      `;
            const options = optRowsU as unknown as ServiceOptionRow[];

            await sql/*sql*/`COMMIT`;

            return res.status(200).json({ ok: true, service, options });
        } catch (e) {
            // ถ้าเกิด error หลังอัปโหลดรูปแล้ว ลบรูปกัน orphan
            try {
                await sql/*sql*/`ROLLBACK`;
            } catch {
                /* noop */
            }
            if (uploadedPublicId) {
                try {
                    await cloudinary.uploader.destroy(uploadedPublicId);
                } catch {
                    /* noop */
                }
            }
            const message = e instanceof Error ? e.message : String(e);
            return res
                .status(500)
                .json({ ok: false, message: message || "Create failed" });
        }
    }

    return res.status(405).end();
}

// บังคับให้ endpoint นี้ใช้สิทธิ์ admin เสมอ (จะมี req.admin ให้ใช้)
// ถ้าอยากเปิด GET ให้สาธารณะ ให้แยกไฟล์ GET ออกต่างหาก
export default withAdminAuth(handler);