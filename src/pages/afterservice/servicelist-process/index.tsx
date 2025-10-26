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
  total_price: number; // ✅ เปลี่ยนเป็น number
  discount: number; // ✅ เพิ่ม
  promo_code: string | null; // ✅ เพิ่ม
  service_date: string;
  service_time: string;
  status_name: string;
  admin_name: string | null;
  user_email: string;
  items: BookingItem[];
  address: string;
};

function ServiceListProcess() {
  const fetchWithToken = useFetchWithToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ จัดการ loading เอง

  const seedetail = useCallback((id: number) => {
    setBookings((prev) => {
      const booking = prev.find((b) => b.booking_id === id);
      if (booking) setSelectedBooking(booking);
      return prev;
    });
  }, []);

  const closedetail = useCallback(() => {
    setSelectedBooking(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        setIsLoading(true); // ✅ เริ่ม loading
        const statusQuery = encodeURIComponent("รอดำเนินการ,ดำเนินการอยู่");
        const res = await fetchWithToken<{ bookings: Booking[] }>(
          `/api/afterservice/order?status=${statusQuery}`,
          { method: "GET" }
        );

        if (!isMounted) return;

        if (!res.bookings || res.bookings.length === 0) {
          setMessage("ไม่มีข้อมูลการซ่อม");
        } else {
          setBookings(res.bookings);
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        const err = error as Error;
        console.error("Error fetching bookings:", err.message);
        setMessage("ไม่มีข้อมูลการซ่อม");
      } finally {
        if (isMounted) {
          setIsLoading(false); // ✅ หยุด loading
        }
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [fetchWithToken]); // ✅ dependency เดียว

  // ✅ แสดง loading ภายใน component
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (message) {
    return <p className="text-center text-gray-600 mt-4">{message}</p>;
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
          totalPrice={order.total_price.toString()}
          onViewDetails={() => seedetail(order.booking_id)}
          detail="รายละเอียด"
        />
      ))}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg">
            <PaymentSummary
              status="ชำระเงินเรียบร้อย !"
              items={selectedBooking.items}
              date={
                selectedBooking.service_date
                  ? new Date(selectedBooking.service_date)
                  : undefined
              }
              time={selectedBooking.service_time}
              address={selectedBooking.address}
              totalPrice={selectedBooking.total_price}
              discount={selectedBooking.discount} // ✅ เพิ่มบรรทัดนี้
              promoCode={selectedBooking.promo_code} // ✅ เพิ่มบรรทัดนี้
              eventname="ปิด"
              clickevent={closedetail}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceListProcess;