// src/pages/api/payment.ts
import { sql } from "lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

// CHANGED: ใช้ Secret Key ทำ Basic Auth
const SECRET = process.env.OMISE_SECRET_KEY!;
const authHeader = "Basic " + Buffer.from(`${SECRET}:`).toString("base64");

// CHANGED: helper แปลงสตางค์ -> บาท
const toBath = (baht: number) => Math.round(baht * 100);
const toBathfromOmise = (baht: number) => Math.round(baht / 100);

// CHANGED: helper form-encode ตามที่ Omise API ต้องการ (x-www-form-urlencoded)
const encode = (obj: Record<string, string | number | null | undefined>) =>
  new URLSearchParams(
    Object.entries(obj).map(([k, v]) => [k, v == null ? "" : String(v)])
  ).toString();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });

  try {
    const { amount, method, tokenId, booking_id } = req.body as {
      amount: number;
      method: "credit_card" | "qr";
      tokenId?: string;
      booking_id: number;
    };

    if (!amount || amount <= 0)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid amount" });

    const amountSatang = toBath(amount);

    if (method === "credit_card") {
      if (!tokenId)
        return res
          .status(400)
          .json({ status: "error", message: "Missing card token" });

      // CHANGED: เรียก Omise REST เพื่อสร้าง charge ด้วย token บัตร
      const resp = await fetch("https://api.omise.co/charges", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encode({
          amount: amountSatang,
          currency: "thb",
          card: tokenId,
          description: "HomeServices - Card payment",
        }),
      });

      const charge = await resp.json();
      // console.log("RESPONSE FROM OMISE :", charge);

      // insert DB
      if (resp.ok && charge?.paid === true) {
        const curBath = toBathfromOmise(charge.amount);
        const result = await sql`
                INSERT INTO payment (booking_id,transaction_id,total_amount,status,payment_method,currency,paid_at)
                VALUES (${booking_id},${charge.id},${curBath},${charge.status},${method},${charge.currency},${charge.paid_at})
                RETURNING payment_id;`;

        // REMOVED: 3DS — ไม่รองรับ
        if (resp.ok && charge?.paid === true && result.length > 0) {
          return res
            .status(200)
            .json({ status: "success", chargeId: charge.id });
        }
      } else {
        const curBath = toBathfromOmise(charge.amount);
        await sql`
              INSERT INTO payment (booking_id,transaction_id,total_amount,status,payment_method,currency,failure_message)
              VALUES (${booking_id},${charge.id},${curBath},${charge.status},${method},${charge.currency},${charge.failure_message})
              RETURNING payment_id;`;
      }

      // end insert DB

      return res.status(400).json({
        status: "error",
        message: charge?.failure_message || charge?.message || "Payment failed",
      });
    }

    if (method === "qr") {
      // CHANGED: 1) สร้าง source promptpay
      const sourceResp = await fetch("https://api.omise.co/sources", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encode({
          amount: amountSatang,
          currency: "thb",
          type: "promptpay",
        }),
      });
      const source = await sourceResp.json();
      if (!sourceResp.ok) {
        return res.status(400).json({
          status: "error",
          message: source?.message || "Create source failed",
        });
      }

      // CHANGED: 2) ผูก source เข้ากับ charge
      const chargeResp = await fetch("https://api.omise.co/charges", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encode({
          amount: amountSatang,
          currency: "thb",
          source: source.id,
          description: "HomeServices - QR code payment",
        }),
      });

      const charge = await chargeResp.json();
      if (!chargeResp.ok) {
        return res.status(400).json({
          status: "error",
          message: charge?.message || "Create charge failed",
        });
      }

      const qrUrl =
        charge?.source?.scannable_code?.image?.download_uri ||
        charge?.source?.scannable_code?.image?.uri;

      return res.status(200).json({
        status: "pending",
        chargeId: charge.id,
        qr_url: qrUrl,
        expires_at: charge?.source?.scannable_code?.expires_at,
      });
    }

    return res.status(400).json({ status: "error", message: "Invalid method" });
  } catch (error) {
    console.error("Payment error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Payment API error";
    return res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
}
