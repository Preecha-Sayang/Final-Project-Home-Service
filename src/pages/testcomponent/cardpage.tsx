import ServiceCard from "../../components/Cards/ServiceCard";
import BookingCard from "../../components/Cards/BookingCard";

export default function CardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Service Cards Section */}
      <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
        <ServiceCard
          imgSrc="https://picsum.photos/349/240"
          category="category"
          title="ServiceCard"
          price="Price"
          onAction={() => alert("Call to Action clicked!")}
          onMoreInfo={() => alert("More Info clicked!")}
        />

        <ServiceCard
          imgSrc="https://picsum.photos/349/240"
          category="category"
          title="ServiceCard"
          price="Price"
          onAction={() => alert("Call to Action clicked!")}
          onMoreInfo={() => alert("More Info clicked!")}
        />
      </div>

      {/* Booking Cards Section - Each card on separate line */}
      <div className="flex flex-col items-center gap-6">
        <BookingCard
          itemCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="สถานะ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <BookingCard
          itemCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="รอดำเนินการ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <BookingCard
          itemCode="..."
          operationDateTime="..."
          employee="..."
          items={["รายการซ่อม"]}
          status="กำลังดำเนินการ"
          totalPrice="..."
          onViewDetails={() => alert("ดูรายละเอียด clicked!")}
        />
        <BookingCard
          itemCode="..."
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
