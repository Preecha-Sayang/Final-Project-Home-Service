// src/pages/api/bookings/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      user_id,
      items,
      total_price,
      discount,
      service_date,
      service_time,
      address_data,
      promotion_id,
      charge_id,
      latitude,
      longitude,
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    if (!total_price || total_price <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!service_date || !service_time || !address_data) {
      return res.status(400).json({ error: "Service details are required" });
    }

    // ⚠️ คำเตือนถ้าไม่มีพิกัด (แต่ไม่บล็อก)
    if (!latitude || !longitude) {
      console.warn('[Create Booking] Warning: No location coordinates provided');
    }

    // สร้าง pinned_location JSON ถ้ามีพิกัด
    let pinnedLocation = null;
    if (latitude && longitude) {
      pinnedLocation = JSON.stringify({
        lat: latitude,
        lng: longitude,
        place_name: address_data.address || null,
      });
    }

    // สร้างการจองในตาราง booking
    const bookingResult = await query(
      `INSERT INTO booking (
        user_id,
        total_price,
        discount,
        service_date,
        service_time,
        address_data,
        promotion_id,
        status_id,
        latitude,
        longitude,
        pinned_location,
        create_at,
        update_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING booking_id`,
      [
        user_id || 1, // ถ้าไม่มี user_id ให้ใช้ default
        total_price,
        discount || 0,
        service_date,
        service_time,
        JSON.stringify(address_data), // เก็บเป็น JSON
        promotion_id || null, // บันทึก promotion_id
        1, // status_id = 1 (pending/confirmed)
        latitude || null, // บันทึก latitude แยก
        longitude || null, // บันทึก longitude แยก
        pinnedLocation, // บันทึก pinned_location เป็น JSON
      ]
    );

    const bookingId = bookingResult.rows[0].booking_id;

    // บันทึกรายการบริการลงตาราง booking_item
    for (const item of items) {
      await query(
        `INSERT INTO booking_item (
          booking_id,
          service_option_id,
          quantity,
          subtotal_price
        ) VALUES ($1, $2, $3, $4)`,
        [
          bookingId,
          item.id, // ใช้ item.id ที่มาจาก frontend
          item.quantity,
          item.price * item.quantity,
        ]
      );
    }

    console.log(`[Booking Created] ID: ${bookingId}, Promotion ID: ${promotion_id}, Discount: ${discount}, Location: (${latitude}, ${longitude})`);

    return res.status(201).json({
      success: true,
      booking_id: bookingId,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({
      error: "Failed to create booking",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}