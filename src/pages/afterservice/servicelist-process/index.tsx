import OrderCard from "@/components/Cards/OrderCard";
import { useEffect, useState, useCallback } from "react";
import { useFetchWithToken } from "@/hooks/useAuth";
import PaymentSummary from "@/components/payments/Payment_summary";

type BookingItem = {
  name: string;
  quantity: number;
  unit: string;
};

type Booking = {
  booking_id: number;
  order_code: string;
  total_price: string;
  service_date: string;
  service_time: string;
  status_name: string;
  admin_name: string | null;
  user_email: string;
  items: BookingItem[];
  address:   string;
};

function ServiceListProcess({ onLoadDone }: { onLoadDone: () => void }) {
  const fetchWithToken = useFetchWithToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // ✅ ใช้ useCallback กัน useEffect เตือน
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const statusQuery = ["รอดำเนินการ", "ดำเนินการอยู่"].join(",");
        const res = await fetchWithToken<{ bookings: Booking[] }>(
          `/api/afterservice/order?status=${statusQuery}`,
          { method: "GET" }
        );

        if (!res.bookings || res.bookings.length === 0) {
          setMessage("ไม่มีข้อมูลการซ่อม");
        } else {
          setBookings(res.bookings);
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching bookings:", err.message);
        setMessage("ไม่มีข้อมูลการซ่อม");
      }
    };

    fetchBookings().then(() => {
      onLoadDone?.();
    });
  }, []);

  if (message) {
    return <p className="text-center text-gray-600 mt-4">{message}</p>;
  }

  const seedetail = (id: number) => {
    const booking = bookings.find((b) => b.booking_id === id);
    setSelectedBooking(booking || null);
  };

  const closedetail = () =>{
    setSelectedBooking(null)
  } 

  return (
    <div className="flex flex-col gap-6 relative">
      {bookings.map((order) => (
        <OrderCard
          key={`booking-${order.booking_id}`}
          orderCode={order.order_code}
          operationDateTime={new Date(order.service_date).toLocaleDateString()}
          employee={order.admin_name}
          items={order.items}
          status={order.status_name}
          totalPrice={order.total_price}
          onViewDetails={() => seedetail(order.booking_id)}
          detail ={"รายละเอียด"}
        />
      ))}

      {/* 🟢 Popup Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg ">
            <PaymentSummary
              status={"ชำระเงินเรียบร้อย !" }
              items={selectedBooking.items}
              date={
                selectedBooking.service_date
                  ? new Date(selectedBooking.service_date)
                  : undefined
              }
              time={selectedBooking.service_time}
              address={selectedBooking.address}
              totalPrice={selectedBooking.total_price}
              eventname="ปิด"
              clickevent={()=>closedetail()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceListProcess;
