import type { NextApiResponse } from "next";
import pool, { query } from "@/../lib/db";
import { withAuth, AuthenticatedNextApiRequest } from "@/middlewere/auth";

// POST /api/profile/update
// อัพเดตข้อมูลผู้ใช้พื้นฐานในตาราง users และที่อยู่หลักในตาราง addresses
// รับข้อมูล JSON body ฟิลด์ที่ส่งมาจะถูกอัพเดต ฟิลด์ที่ไม่ส่งจะถูกข้าม
// ตัวอย่าง Body:
// {
//   fullname?: string,
//   email?: string,
//   phone_number?: string,
//   address?: string,
//   province_code?: number|string,
//   district_code?: number|string,
//   subdistrict_code?: number|string,
//   address_id?: number // ไม่บังคับ ถ้ามีจะอัพเดตที่อยู่นี้โดยเฉพาะ
// }
async function handler(req: AuthenticatedNextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "PUT") {
    res.setHeader("Allow", "POST, PUT");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = Number(req.user?.userId);
  if (!userId || Number.isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  const {
    fullname,
    email,
    phone_number,
    address,
    province_code,
    district_code,
    subdistrict_code,
    address_id,
    avatar,
  } = (req.body ?? {}) as {
    fullname?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    province_code?: number | string;
    district_code?: number | string;
    subdistrict_code?: number | string;
    address_id?: number;
    avatar?: string;
  };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // อัพเดตตาราง users ถ้ามีข้อมูลผู้ใช้ที่ต้องการเปลี่ยน
    const userUpdates: string[] = [];
    const userParams: any[] = [];
    if (typeof fullname === "string") {
      userParams.push(fullname);
      userUpdates.push(`fullname = $${userParams.length}`);
    }
    if (typeof email === "string") {
      userParams.push(email);
      userUpdates.push(`email = $${userParams.length}`);
    }
    if (typeof phone_number === "string") {
      userParams.push(phone_number);
      userUpdates.push(`phone_number = $${userParams.length}`);
    }
    if (typeof avatar === "string") {
      userParams.push(avatar);
      userUpdates.push(`avatar = $${userParams.length}`);
    }
    if (userUpdates.length > 0) {
      userParams.push(userId);
      await client.query(
        `UPDATE users SET ${userUpdates.join(", ")} WHERE user_id = $${userParams.length}`,
        userParams
      );
    }

    // เตรียมข้อมูลที่อยู่
    const hasAddressPayload =
      typeof address === "string" ||
      typeof province_code !== "undefined" ||
      typeof district_code !== "undefined" ||
      typeof subdistrict_code !== "undefined";

    if (hasAddressPayload) {
      // ต้องมีข้อความที่อยู่เมื่ออัพเดต/สร้างที่อยู่
      if (typeof address !== "string" || address.trim() === "") {
        return res.status(400).json({ error: "Address text is required" });
      }

      // แปลงเป็นตัวเลขถ้ามีข้อมูล
      const provinceIdVal =
        typeof province_code !== "undefined" && province_code !== null && `${province_code}`.trim() !== ""
          ? Number(province_code)
          : undefined;
      const districtIdVal =
        typeof district_code !== "undefined" && district_code !== null && `${district_code}`.trim() !== ""
          ? Number(district_code)
          : undefined;
      const subdistrictCodeVal =
        typeof subdistrict_code !== "undefined" && subdistrict_code !== null && `${subdistrict_code}`.trim() !== ""
          ? Number(subdistrict_code)
          : undefined;

      // ตรวจสอบว่าจะอัพเดตหรือเพิ่มที่อยู่ไหน และบังคับให้มีที่อยู่เดียวต่อผู้ใช้
      let targetAddressId = address_id;
      if (!targetAddressId) {
        const existingAll = await client.query(
          `SELECT address_id FROM addresses WHERE user_id = $1 ORDER BY address_id ASC`,
          [userId]
        );
        if (existingAll.rows.length > 0) {
          targetAddressId = existingAll.rows[0].address_id as number;
          // ลบที่อยู่เพิ่มเติมเพื่อบังคับให้มีที่อยู่เดียว
          if (existingAll.rows.length > 1) {
            await client.query(
              `DELETE FROM addresses WHERE user_id = $1 AND address_id <> $2`,
              [userId, targetAddressId]
            );
          }
        }
      } else {
        // ถ้าระบุ address_id มา ยังคงบังคับให้มีที่อยู่เดียวสำหรับผู้ใช้คนนี้
        await client.query(
          `DELETE FROM addresses WHERE user_id = $1 AND address_id <> $2`,
          [userId, targetAddressId]
        );
      }

      if (targetAddressId) {
        const addrUpdates: string[] = [];
        const addrParams: any[] = [];
        if (typeof address === "string") {
          addrParams.push(address);
          addrUpdates.push(`address = $${addrParams.length}`);
        }
        if (typeof provinceIdVal !== "undefined") {
          addrParams.push(provinceIdVal);
          addrUpdates.push(`province_code = $${addrParams.length}`);
        }
        if (typeof districtIdVal !== "undefined") {
          addrParams.push(districtIdVal);
          addrUpdates.push(`district_code = $${addrParams.length}`);
        }
        if (typeof subdistrictCodeVal !== "undefined") {
          addrParams.push(subdistrictCodeVal);
          addrUpdates.push(`subdistrict_code = $${addrParams.length}`);
        }

        if (addrUpdates.length > 0) {
          addrParams.push(targetAddressId, userId);
          await client.query(
            `UPDATE addresses SET ${addrUpdates.join(", ")} WHERE address_id = $${addrParams.length - 1} AND user_id = $${addrParams.length}`,
            addrParams
          );
        }
      } else {
        // เพิ่มที่อยู่ใหม่
        const cols: string[] = ["user_id"];
        const vals: string[] = ["$1"];
        const params: any[] = [userId];
        if (typeof address === "string") {
          cols.push("address");
          params.push(address);
          vals.push(`$${params.length}`);
        }
        if (typeof provinceIdVal !== "undefined") {
          cols.push("province_code");
          params.push(provinceIdVal);
          vals.push(`$${params.length}`);
        }
        if (typeof districtIdVal !== "undefined") {
          cols.push("district_code");
          params.push(districtIdVal);
          vals.push(`$${params.length}`);
        }
        if (typeof subdistrictCodeVal !== "undefined") {
          cols.push("subdistrict_code");
          params.push(subdistrictCodeVal);
          vals.push(`$${params.length}`);
        }
        console.log(`INSERT INTO addresses (${cols.join(",")}) VALUES (${vals.join(",")})`);
        await client.query(
          `INSERT INTO addresses (${cols.join(",")}) VALUES (${vals.join(",")})`,
          params
        );
      }
    }

    await client.query("COMMIT");

    // คืนค่าข้อมูลโปรไฟล์ที่อัพเดตแล้ว
    const result = await query(
      `SELECT 
        u.user_id,
        u.fullname,
        u.email,
        u.phone_number,
        u.create_at,
        u.avatar,
        COALESCE(
          json_agg(
            json_build_object(
              'address_id', a.address_id,
              'user_id', a.user_id,
              'address', a.address,
              'province_code', a.province_code,
              'district_code', a.district_code,
              'subdistrict_code', a.subdistrict_code
            )
            ORDER BY a.address_id
          ) FILTER (WHERE a.address_id IS NOT NULL),
          '[]'
        ) AS addresses
      FROM users u
      LEFT JOIN addresses a ON a.user_id = u.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.fullname, u.email, u.phone_number, u.create_at, u.avatar`,
      [userId]
    );

    const row = result.rows[0] as any;

    return res.status(200).json({
      success: true,
      profile: {
        user_id: row.user_id,
        fullname: row.fullname,
        email: row.email,
        phone_number: row.phone_number,
        create_at: row.create_at,
        avatar: row.avatar || null,
        addresses: row.addresses ?? [],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("/api/profile/update error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
}

export default withAuth(handler);
