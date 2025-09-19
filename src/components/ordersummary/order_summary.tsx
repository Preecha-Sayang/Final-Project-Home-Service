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
}

export default function OrderSummary({
  items,
  date,
  time,
  address,
  promotion,
  total,
  defaultOpen = true,
}: OrderSummaryProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="w-[375px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm mt-[20px] ml-[20px] flex flex-col gap-2">
      {/* Header พร้อม toggle */}
      <div
        className="mb-3 flex cursor-pointer items-center justify-between select-none"
        onClick={() => setOpen(!open)}
      >
        <h3 className="font-semibold text-gray-700">สรุปรายการ</h3>
        <span className="text-gray-500">{open ? "▲" : "▼"}</span>
      </div>

      {/* รายละเอียดแสดงเมื่อ open = true */}
      {open && (
        <>
          <div className="space-y-1 text-sm text-gray-700">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.quantity} รายการ</span>
              </div>
            ))}
          </div>

          <hr className="my-3 bg-gray-300" />


          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>วันที่</span>
              <span>{date}</span>
            </div>
            <div className="flex justify-between">
              <span>เวลา</span>
              <span>{time}</span>
            </div>
            <div className="flex justify-between">
              <span>สถานที่</span>
              <span className="w-2/3 text-right">{address}</span>
            </div>
          </div>

          <hr className="my-3 bg-gray-300" />

          {promotion && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Promotion Code</span>
              <span className="text-red-500">- {promotion.toFixed(2)} ฿</span>
            </div>
          )}
        </>
      )}

      {/* รวม */}
      <div className="mt-2 flex justify-between text-base font-semibold">
        <span className="text-gray-700">รวม</span>
        <span className="text-gray-950">{total.toLocaleString()} ฿</span>
      </div>
    </div>
  );
}