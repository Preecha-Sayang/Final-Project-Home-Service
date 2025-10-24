
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

function ServiceListSuccess({ onLoadDone }: { onLoadDone: () => void }) {
  const fetchWithToken = useFetchWithToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string>("");
   const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ✅ ใช้ useCallback กัน useEffect เตือน
useEffect(() => {
  const fetchBookings = async () => {
    try {
      const statusQuery = "เสร็จสิ้น"
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


  useEffect(() => {
    console.log("📦 bookings updated:", bookings);
  }, [bookings]);

  if (message) {
    return <p className="text-center text-gray-600 mt-4">{message}</p>;
  }



  const handleSubmitComment = async (rating: number, comment: string) => {
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
    toast.success("บันทึกสำเร็จ!", {
  style: {
    background: "#1e40af", // สีฟ้า
    color: "#fff",
    fontWeight: "bold",
  },
});
    } catch (error) {
      console.error(error);
        toast("ส่งความคิดเห็นไม่สำเร็จ", {
      style: {
        background: "#dc2626", // สีแดง
        color: "#fff",
        fontWeight: "bold",
      },
    });
    }
  };





  return (
    <div>
    <div className="flex flex-col gap-6">
      {bookings .map((order) => (
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
            detail ={ order.comment_rate ? "ได้แสดงความคิดเห็นแล้ว" : "แสดงความคิดเห็น"}
            onViewDetails={
            order.comment_rate
              ? undefined
              : () => setSelectedBooking(order)
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
