import OrderCard from "@/components/Cards/OrderCard"
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";


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


function OrderService(){
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


 const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/afterservice/order", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setBookings(res.data.bookings);
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

useEffect(() => {
  if (!accessToken) return;
  fetchBookings();
}, [accessToken]);

if (loading) return <p>กำลังโหลดข้อมูล...</p>;
if (error) return <p className="text-red-500">{error}</p>;






return(
    <div className="flex flex-col gap-6">


        {bookings.map((order, index) => (
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
)
}

export default OrderService