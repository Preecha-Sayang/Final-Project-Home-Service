import OrderCard from "@/components/Cards/OrderCard";
import { useEffect, useState, useCallback } from "react";
import { useFetchWithToken } from "@/hooks/useAuth";
import StarRatingModal from "@/components/starrating";
import toast from "react-hot-toast";

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
  comment_rate?: number | null;
  comment_text?: string | null;
};

function ServiceListSuccess() {
  const fetchWithToken = useFetchWithToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const statusQuery = encodeURIComponent("ดำเนินการสำเร็จ");
        const res = await fetchWithToken<{ bookings: Booking[] }>(
          `/api/afterservice/order?status=${statusQuery}`,
          { method: "GET" }
        );

        if (!isMounted) return;

        if (!res.bookings || res.bookings.length === 0) {
          setMessage("ไม่มีประวัติการซ่อม");
        } else {
          setBookings(res.bookings);
        }
      } catch (error: unknown) {
        if (!isMounted) return;

        const err = error as Error;
        console.error("Error fetching bookings:", err.message);
        setMessage("ไม่มีประวัติการซ่อม");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      isMounted = false;
    };
  }, [fetchWithToken]); // ✅ Empty array - fetch only once on mount

  // ✅ ย้าย handleSubmitComment เข้ามาใน component
  const handleSubmitComment = useCallback(
    async (rating: number, comment: string) => {
      if (!selectedBooking) return;

      try {
        await fetchWithToken(`/api/afterservice/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: {
            booking_id: selectedBooking.booking_id,
            comment_rate: rating,
            comment_text: comment,
          },
        });

        setBookings((prev) =>
          prev.map((b) =>
            b.booking_id === selectedBooking.booking_id
              ? { ...b, comment_rate: rating, comment_text: comment }
              : b
          )
        );

        setSelectedBooking(null); // ✅ ปิด modal หลังส่งสำเร็จ

        toast.success("บันทึกสำเร็จ!", {
          style: {
            background: "#1e40af",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("ส่งความคิดเห็นไม่สำเร็จ", {
          style: {
            background: "#dc2626",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }
    },
    [selectedBooking, fetchWithToken]
  );

  // ✅ แสดง loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ แสดง message ถ้าไม่มีข้อมูล
  if (message) {
    return <p className="text-center text-gray-600 mt-4">{message}</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        {bookings.map((order) => (
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
            detail={
              order.comment_rate
                ? "ได้แสดงความคิดเห็นแล้ว"
                : "แสดงความคิดเห็น"
            }
            onViewDetails={
              order.comment_rate ? undefined : () => setSelectedBooking(order)
            }
          />
        ))}
      </div>

      {/* Star Rating Modal */}
      <StarRatingModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onSubmit={handleSubmitComment}
      />
    </div>
  );
}

export default ServiceListSuccess;