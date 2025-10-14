import Navbar from "@/components/navbar/navbar";
import PaymentSummary from "@/components/payments/Payment_summary";

export default function PaymentSum() {
  return (
    <div>
      <div>
        <Navbar />
      </div>

      <div className="justify-center items-center mt-16">
        <PaymentSummary
          status={"ชำระเงินเรียบร้อยแล้ว !"}
          itemName="9000-18,000 BTU"
          quantity={2}
          date={new Date(2021, 3, 23).toLocaleDateString("th-TH", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })} // ✅ 23 เม.ย. 2021 (เดือนเริ่มที่ 0 → ม.ค.=0, เม.ย.=3)
          time="11:00" // ✅ เวลาเก็บเป็น string
          address="จตุจักร กรุงเทพ"
          totalPrice={15550}
        />
      </div>
    </div>
  );
}
