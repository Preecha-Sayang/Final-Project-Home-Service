import { useState } from "react";
import OrderSummary from "@/components/ordersummary/order_summary";
import Breadcrumb from "@/components/breadcrump/bread_crump";


export default function Home() {
  const [current, setCurrent] = useState("ล้างแอร์");

  return (
    <div>
        {/* Order Summary Section */}
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