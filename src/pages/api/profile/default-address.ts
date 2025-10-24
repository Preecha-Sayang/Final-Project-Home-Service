import type { NextApiResponse } from "next";
import { query } from "../../../../lib/db";
import { withAuth, AuthenticatedNextApiRequest } from "../../../middlewere/auth";

export interface DefaultAddress {
  address: string;
  province_code: number;
  district_code: number;
  subdistrict_code: number;
}

/**
 * GET /api/profile/default-address
 * 
 * ดึงข้อมูลที่อยู่เริ่มต้นของผู้ใช้
 * ถ้า province_code หรือ district_code เป็น null จะหาจาก subdistrict_code ให้อัตโนมัติ
 * ใช้ตาราง geography สำหรับ lookup
 */
async function handler(
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const userId = Number(req.user?.userId);
    console.log('[default-address API] User ID:', userId);
    
    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    // ดึงข้อมูลที่อยู่
    console.log('[default-address API] Fetching address for user:', userId);
    
    const addressQuery = `
      SELECT 
        address_id,
        user_id,
        address,
        province_code,
        district_code,
        subdistrict_code
      FROM addresses
      WHERE user_id = $1
      LIMIT 1
    `;

    const addressResult = await query(addressQuery, [userId]);
    console.log('[default-address API] Query result:', addressResult.rows);

    if (addressResult.rows.length === 0) {
      console.log('[default-address API] No address found for user');
      return res.status(200).json({ 
        hasAddress: false,
        message: "No default address found"
      });
    }

    let addressData = addressResult.rows[0] as {
      address_id: number;
      user_id: number;
      address: string;
      province_code: number | null;
      district_code: number | null;
      subdistrict_code: number | null;
    };

    console.log('[default-address API] Original address data:', addressData);

    // ถ้าไม่มี province_code หรือ district_code ให้หาจาก subdistrict_code
    if (addressData.subdistrict_code && (!addressData.province_code || !addressData.district_code)) {
      console.log('[default-address API] Missing province/district code, looking up from subdistrict...');
      
      // ใช้ตาราง geography แทน
      const lookupQuery = `
        SELECT DISTINCT
          district_code,
          province_code
        FROM geography
        WHERE subdistrict_code = $1
        LIMIT 1
      `;
      
      const lookupResult = await query(lookupQuery, [addressData.subdistrict_code]);
      
      if (lookupResult.rows.length > 0) {
        const locationData = lookupResult.rows[0] as {
          district_code: number;
          province_code: number;
        };
        
        console.log('[default-address API] Found location data:', locationData);
        
        // อัพเดท addressData ด้วยข้อมูลที่หาได้
        addressData = {
          ...addressData,
          district_code: addressData.district_code || locationData.district_code,
          province_code: addressData.province_code || locationData.province_code,
        };
        
        console.log('[default-address API] Updated address data:', addressData);
      }
    }

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!addressData.province_code || !addressData.district_code || !addressData.subdistrict_code) {
      console.log('[default-address API] Incomplete address data');
      return res.status(200).json({ 
        hasAddress: false,
        message: "Address data is incomplete"
      });
    }

    const responseData = {
      hasAddress: true,
      address: {
        address: addressData.address,
        province_code: addressData.province_code,
        district_code: addressData.district_code,
        subdistrict_code: addressData.subdistrict_code,
      },
    };

    console.log('[default-address API] Response:', responseData);

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("[default-address API] Error:", err);
    
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: err instanceof Error ? err.message : "Unknown error",
      details: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
}

export default withAuth(handler);