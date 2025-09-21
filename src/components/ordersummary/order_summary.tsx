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
  useIcons = true,
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