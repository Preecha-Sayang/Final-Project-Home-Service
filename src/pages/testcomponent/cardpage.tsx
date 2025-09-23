import ServiceCard from "../../components/Cards/ServiceCard";
import BookingCard from "../../components/Cards/BookingCard";

export default function CardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Request Card Section */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <RequestCard
          title="ล้างแอร์"
          operationDateTime="25/04/2563 เวลา 13.00 น."
          orderCode="AD04071205"
          items="ล้างแอร์ 9,000 - 18,000 BTU, ติดผนัง 2 เครื่อง"
          totalPrice="1,550.00"
          address="444/4 คอนโดสุภาลัย เสนานิคม จตุจักร กรุงเทพฯ"
          onAccept={() => alert("รับงาน clicked!")}
          onReject={() => alert("ปฏิเสธ clicked!")}
        />
      </div>

      {/* Order Cards Section - Each card on separate line */}
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <OrderCard
          orderCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="สถานะ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <OrderCard
          orderCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="รอดำเนินการ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <OrderCard
          orderCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="กำลังดำเนินการ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <OrderCard
          orderCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="ดำเนินการสำเร็จ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
      </div>
    </div>
  );
}
