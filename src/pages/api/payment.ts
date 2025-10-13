// src/pages/api/payment.ts
import type { NextApiRequest, NextApiResponse } from "next";

// CHANGED: ใช้ Secret Key ทำ Basic Auth
const SECRET = process.env.OMISE_SECRET_KEY!;
const authHeader = "Basic " + Buffer.from(`${SECRET}:`).toString("base64");

// CHANGED: helper แปลงบาท -> สตางค์
const toSatang = (baht: number) => Math.round(baht * 100);

// CHANGED: helper form-encode ตามที่ Omise API ต้องการ (x-www-form-urlencoded)
const encode = (obj: Record<string, any>) =>
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
    const { amount, method, tokenId } = req.body as {
      amount: number;
      method: "credit_card" | "qr";
      tokenId?: string;
    };

    if (!amount || amount <= 0)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid amount" });

    const amountSatang = toSatang(amount);

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

      // REMOVED: 3DS — ไม่รองรับ
      if (resp.ok && charge?.paid === true) {
        return res.status(200).json({ status: "success", chargeId: charge.id });
      }
      return res
        .status(400)
        .json({
          status: "error",
          message:
            charge?.failure_message || charge?.message || "Payment failed",
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
        return res
          .status(400)
          .json({
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
          description: "บริการล้างแอร์- PromptPay",
        }),
      });

      const charge = await chargeResp.json();
      if (!chargeResp.ok) {
        return res
          .status(400)
          .json({
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
  } catch (error: any) {
    console.error("Payment error:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: error?.message || "Payment API error",
      });
  }
}
