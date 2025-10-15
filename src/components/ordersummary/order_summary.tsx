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
  total: number;
  defaultOpen?: boolean;
  fallbackText?: string; 
  showPromotionWhenZero?: boolean; // จะโชว์ promotion=0 หรือไม่
  currency?: string;              // สัญลักษณ์สกุลเงิน
  decimalDigits?: number;         // จำนวนทศนิยม (default = 2)
  useIcons?: boolean; 
}

export default function OrderSummary({
  items,
  date,
  time,
  address,
  promotion,
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

  return (
    <div className="w-[375px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm mt-[16px] ml-[16px] flex flex-col">
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

          {(promotion !== undefined &&
            (showPromotionWhenZero || promotion !== 0)) && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Promotion Code</span>
              <span className="text-red-500 font-medium text-sm">
                -{formatNumber(promotion)} {currency}
              </span>
            </div>
          )}
        </>
      )}

      {/* รวม */}
      <div className="pt-2 flex justify-between items-center">
        <span className="text-gray-800 font-semibold text-base">รวม</span>
        <span className="text-gray-950 font-semibold text-base">
          {formatNumber(total)} {currency}
        </span>
      </div>
    </div>
  );
}

/**
 * วิธีใช้งาน OrderSummary Component
 * 
 * OrderSummary Component เป็นคอมโพเนนต์สรุปรายการสั่งซื้อ/จองบริการ
 * แสดงรายการสินค้า/บริการ, วันที่, เวลา, ที่อยู่, ส่วนลด และยอดรวม
 * 
 * คุณสมบัติหลัก:
 * - แสดงรายการสินค้า/บริการพร้อมจำนวน
 * - แสดงวันที่, เวลา, และที่อยู่
 * - แสดงส่วนลดจาก promotion code
 * - คำนวณและแสดงยอดรวม
 * - รองรับการเปิด/ปิดรายละเอียด
 * - รองรับสกุลเงินและทศนิยมที่กำหนดเอง
 * - สไตล์ที่สอดคล้องกับ design system
 * 
 * ตัวอย่างการใช้งาน:
 * 
 * 1) การใช้งานพื้นฐาน - สรุปรายการบริการ:
 *    const orderItems = [
 *      { name: "ทำความสะอาดบ้าน", quantity: 1 },
 *      { name: "ล้างแอร์", quantity: 2 },
 *      { name: "ซ่อมเครื่องซักผ้า", quantity: 1 }
 *    ];
 *    
 *    <OrderSummary
 *      items={orderItems}
 *      date="15 มกราคม 2567"
 *      time="14:00 - 16:00"
 *      address="123 ถนนสุขุมวิท กรุงเทพฯ 10110"
 *      promotion={100}
 *      total={1500}
 *    />
 * 
 * 3) การใช้งานแบบไม่มี Promotion:
 *    <OrderSummary
 *      items={[
 *        { name: "บริการทำความสะอาด", quantity: 1 }
 *      ]}
 *      date="25 มกราคม 2567"
 *      time="09:00 - 11:00"
 *      address="789 ถนนลาดพร้าว กรุงเทพฯ"
 *      total={800}
 *      showPromotionWhenZero={false}
 *    />
 *
 * การแสดงผล:
 * - Header พร้อมปุ่มเปิด/ปิดรายละเอียด
 * - รายการสินค้า/บริการพร้อมจำนวน
 * - ข้อมูลวันที่, เวลา, และที่อยู่
 * - ส่วนลดจาก promotion code (ถ้ามี)
 * - ยอดรวมทั้งหมด
 * - รองรับ responsive design
 * 
 * สถานะต่างๆ:
 * - Open: แสดงรายละเอียดทั้งหมด
 * - Closed: แสดงเฉพาะ header และยอดรวม
 * - With Promotion: แสดงส่วนลดด้วยสีแดง
 * - Without Promotion: ไม่แสดงส่วนลด
 * 
 * Best Practices:
 * 1. ใช้ items array ที่มีข้อมูลครบถ้วน
 * 2. ตรวจสอบ total ให้ถูกต้อง
 * 3. ใช้ fallbackText ที่เหมาะสมเมื่อไม่มีข้อมูล
 * 4. ตั้งค่า defaultOpen ตาม UX ที่ต้องการ
 * 5. ใช้ currency และ decimalDigits ที่สอดคล้องกับระบบ
 * 6. ตรวจสอบ promotion logic ให้ถูกต้อง
 * 
 * การใช้งานกับ Form Libraries:
 * 
 * React Hook Form:
 * ```tsx
 * const { watch } = useForm();
 * const formData = watch();
 * 
 * <OrderSummary
 *   items={formData.items}
 *   date={formData.date}
 *   time={formData.time}
 *   address={formData.address}
 *   promotion={formData.promotion}
 *   total={formData.total}
 * />
 */ 