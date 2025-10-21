// src/app/api/promotions/promotionusage/route.ts
import { NextRequest, NextResponse } from "next/server";

export interface PromotionUsageRequest {
  code: string;
  userId: string;
  orderAmount: number;
  orderId?: string;
  preview?: boolean;
}

export interface PromotionUsageResponse {
  ok: boolean;
  message: string;
  discount?: number;
  finalAmount?: number;
  [key: string]: any; // เผื่อคุณเพิ่ม field เพิ่มเอง
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<PromotionUsageResponse>> {
  try {
    const body: PromotionUsageRequest = await req.json();
    const { code, userId, orderAmount, orderId, preview } = body;

    // 👉 ใส่ logic ของคุณตรงนี้
    // เช่น ตรวจสอบโค้ด, คำนวณส่วนลด, บันทึกการใช้โปรโมชั่น

    return NextResponse.json({
      ok: true,
      message: "Promotion usage handled successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
