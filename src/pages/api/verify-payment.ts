// src/pages/api/verify-payment.ts
import type { NextApiRequest, NextApiResponse } from "next";

const SECRET = process.env.OMISE_SECRET_KEY!;
const authHeader = "Basic " + Buffer.from(`${SECRET}:`).toString("base64");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const { chargeId } = req.query;

    if (!chargeId || typeof chargeId !== "string") {
      return res
        .status(400)
        .json({ status: "error", message: "Missing chargeId" });
    }

    // เรียก Omise API เพื่อตรวจสอบสถานะของ charge
    const response = await fetch(`https://api.omise.co/charges/${chargeId}`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return res.status(400).json({
        status: "error",
        message: "Failed to verify payment",
      });
    }

    const charge = await response.json();

    // ตรวจสอบสถานะการชำระเงิน
    const isPaid = charge.paid === true;
    const status = charge.status; // 'successful', 'failed', 'pending', etc.

    return res.status(200).json({
      status: isPaid ? "success" : "pending",
      paid: isPaid,
      chargeStatus: status,
      amount: charge.amount,
      currency: charge.currency,
      chargeId: charge.id,
      created: charge.created,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Verify payment API error";
    return res.status(500).json({
      status: "error",
      message: errorMessage,
    });
  }
}

