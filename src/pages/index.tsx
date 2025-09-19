import OrderSummary from "@/components/ordersummary/order_summary";
import Breadcrumb from "@/components/breadcrump/bread_crump";
import { useState } from "react";

export default function Home() {
  const [current, setCurrent] = useState("ล้างแอร์");
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-10">
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <Breadcrumb current={current} />
      </div>

      {/* ปุ่มเปลี่ยนค่า */}
      <div className="flex gap-3">
        <button
          onClick={() => setCurrent("ล้างแอร์")}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          ล้างแอร์
        </button>
        <button
          onClick={() => setCurrent("ทำความสะอาด")}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          ทำความสะอาด
        </button>
      </div>
    </div>


      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="space-y-6 w-full max-w-md">
        {/* กล่องแบบเปิดรายละเอียด */}
        <OrderSummary
          items={[
            { name: "9,000 - 18,000 BTU, แบบติดผนัง", quantity: 2 },
            { name: "9,000 - 18,000 BTU, แบบติดผนัง", quantity: 2 },
          ]}
          date="23 เม.ย. 2022"
          time="11.00 น."
          address="444/4 คอนโดสุภาลัย เสนานิคม จตุจักร กรุงเทพฯ"
          promotion={50}
          total={1550}
          defaultOpen={true}
        />

        {/* กล่องแบบปิดรายละเอียดเริ่มต้น */}
        <OrderSummary
          items={[
            { name: "9,000 - 18,000 BTU, แบบติดผนัง", quantity: 2 },
            { name: "9,000 - 18,000 BTU, แบบติดผนัง", quantity: 2 },
          ]}
          date="23 เม.ย. 2022"
          time="11.00 น."
          address="444/4 คอนโดสุภาลัย เสนานิคม จตุจักร กรุงเทพฯ"
          total={1600}
          defaultOpen={false}
        />
      </div>
    </div>
    </div>
  );
}
