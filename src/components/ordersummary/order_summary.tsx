import { useState } from "react";

type Item = {
  name: string;
  quantity: number;
};

interface OrderSummaryProps {
  items: Item[];
  date?: string;
  time?: string;
  address?: string;
  promotion?: number;
  promotionCode?: string | null;
  total: number;
  defaultOpen?: boolean;
  fallbackText?: string;
  showPromotionWhenZero?: boolean;
  currency?: string;
  decimalDigits?: number;
  useIcons?: boolean;
}

export default function OrderSummary({
  items,
  date,
  time,
  address,
  promotion,
  promotionCode,
  total,
  defaultOpen = true,
  fallbackText = "-",
  showPromotionWhenZero = false,
  currency = "฿",
  decimalDigits = 2,
}: OrderSummaryProps) {
  const [open, setOpen] = useState(defaultOpen);

  const formatNumber = (num: number) =>
    num.toLocaleString(undefined, {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    });

  // คำนวณราคาหลังหักส่วนลด
  const finalTotal = promotion && promotion > 0 ? total - promotion : total;

  return (
    <div className=" md:w-[375px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:mt-[16px] md:ml-[16px] flex flex-col">
      {/* Header พร้อม toggle */}
      <div
        className="mb-2 flex cursor-pointer items-center justify-between select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="text-lg font-semibold text-gray-700">สรุปรายการ</div>
        <span className="text-gray-900 text-sm font-medium">{open ? "▲" : "▼"}</span>
      </div>

      {/* รายละเอียดแสดงเมื่อ open = true */}
      {open && (
        <>
          <div className="space-y-3 mb-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="text-gray-950 font-medium text-sm leading-5 flex-1 pr-4">
                  {item.name}
                </span>
                <span className="text-gray-600 text-sm font-medium whitespace-nowrap">
                  {item.quantity} รายการ
                </span>
              </div>
            ))}
          </div>

          <hr className="border-t-2 border-gray-200 mb-3" />

          <div className="space-y-3 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">วันที่</span>
              <span className="text-gray-950 font-medium text-sm">
                {date ?? fallbackText}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">เวลา</span>
              <span className="text-gray-950 font-medium text-sm">
                {time ?? fallbackText}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-600 text-sm">สถานที่</span>
              <span className="text-right text-gray-950 font-medium text-sm leading-5 max-w-[200px]">
                {address ?? fallbackText}
              </span>
            </div>
          </div>

          <hr className="border-t-2 border-gray-200 mb-3" />

          {/* แสดงยอดรวมก่อนลด */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm">ยอดรวม</span>
            <span className="text-gray-950 font-medium text-sm">
              {formatNumber(total)} {currency}
            </span>
          </div>

          {/* แสดงส่วนลด */}
          {promotion !== undefined &&
            (showPromotionWhenZero || promotion !== 0) && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">
                  ส่วนลด {promotionCode && `(${promotionCode})`}
                </span>
                <span className="text-red-500 font-medium text-sm">
                  -{formatNumber(promotion)} {currency}
                </span>
              </div>
            )}
        </>
      )}

      {/* ยอดสุทธิ - แสดงเสมอ */}
      <div className="pt-2 flex justify-between items-center border-t-2 border-gray-300">
        <span className="text-gray-800 font-semibold text-base">
          {promotion && promotion > 0 ? "ยอดสุทธิ" : "รวม"}
        </span>
        <span className="text-blue-600 font-bold text-lg">
          {formatNumber(finalTotal)} {currency}
        </span>
      </div>
    </div>
  );
}

/**
 * วิธีใช้งาน OrderSummary Component (Updated)
 *
 * OrderSummary Component เป็นคอมโพเนนต์สรุปรายการสั่งซื้อ/จองบริการ
 * แสดงรายการสินค้า/บริการ, วันที่, เวลา, ที่อยู่, ส่วนลด และยอดรวม
 *
 * คุณสมบัติหลัก:
 * - แสดงรายการสินค้า/บริการพร้อมจำนวน
 * - แสดงวันที่, เวลา, และที่อยู่
 * - แสดงส่วนลดจาก promotion code พร้อมชื่อโค้ด
 * - คำนวณและแสดงยอดรวมก่อนและหลังหักส่วนลด
 * - รองรับการเปิด/ปิดรายละเอียด
 * - รองรับสกุลเงินและทศนิยมที่กำหนดเอง
 *
 * ตัวอย่างการใช้งาน:
 *
 * 1) การใช้งานพื้นฐาน - สรุปรายการบริการ:
 * const orderItems = [
 *   { name: "ทำความสะอาดบ้าน", quantity: 1 },
 *   { name: "ล้างแอร์", quantity: 2 },
 * ];
 * 
 * <OrderSummary
 *   items={orderItems}
 *   date="15 มกราคม 2567"
 *   time="14:00 - 16:00"
 *   address="123 ถนนสุขุมวิท กรุงเทพฯ 10110"
 *   promotion={150}
 *   promotionCode="SAVE10"
 *   total={1500}
 * />
 *
 * จะแสดงผล:
 * ยอดรวม:    1,500.00 ฿
 * ส่วนลด (SAVE10): -150.00 ฿
 * ─────────────────────
 * ยอดสุทธิ:  1,350.00 ฿
 *
 * 2) การใช้งานแบบไม่มี Promotion:
 * <OrderSummary
 *   items={orderItems}
 *   total={800}
 *   showPromotionWhenZero={false}
 * />
 */