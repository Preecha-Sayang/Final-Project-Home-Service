
import OrderCard from "@/components/Cards/OrderCard";
import { useEffect, useState, useCallback } from "react";
import { useFetchWithToken } from "@/hooks/useAuth";

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
};

function ServiceListSuccess({ onLoadDone }: { onLoadDone: () => void }) {
  const fetchWithToken = useFetchWithToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");

  // ✅ ใช้ useCallback กัน useEffect เตือน
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetchWithToken<{ bookings: Booking[] }>(
        "/api/afterservice/order",
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
  }, [fetchWithToken]);

  useEffect(() => {
    const load = async () => {
      await fetchBookings();
      onLoadDone();
    };
    load();
  }, [fetchBookings, onLoadDone]);

  if (message) {
    return <p className="text-center text-gray-600 mt-4">{message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {bookings
        .filter(
          (order) =>
            order.status_name === "ดำเนินการสำเร็จ"
        )
        .map((order) => (
          <OrderCard
            key={`booking-${order.booking_id}`}
            orderCode={order.order_code}
            operationDateTime={new Date(
              order.service_date
            ).toLocaleDateString()}
            employee={order.admin_name}
            items={order.items}
            status={order.status_name}
            totalPrice={order.total_price}
          />
        ))}
    </div>
  );
}

export default ServiceListSuccess;
