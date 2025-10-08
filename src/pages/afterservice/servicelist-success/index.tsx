import OrderCard from "@/components/Cards/OrderCard";
import { useEffect, useState } from "react";
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
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetchWithToken<{ bookings: Booking[] }>("/api/afterservice/order", {
        method: "GET",
      });
      setBookings(res.bookings);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "เกิดข้อผิดพลาด");
    } 
  };

  useEffect(() => {
    const load = async () => {
    await fetchBookings();
    onLoadDone(); // ✅ เรียกหลังจากโหลดข้อมูลเสร็จ
  };
  load();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      {bookings
      .filter(order => order.status_name === "ดำเนินการสำเร็จ")
      .map((order) => (
        <OrderCard
          key={`booking-${order.booking_id}`}
          orderCode={order.order_code}
          operationDateTime={new Date(order.service_date).toLocaleDateString()}
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