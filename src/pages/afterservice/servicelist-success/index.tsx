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
  const [page, setPage] = useState(1);
  const [limit] = useState(4); // ✅ กำหนด 4 รายการต่อหน้า
  const [totalCount, setTotalCount] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const statusQuery = encodeURIComponent("ดำเนินการสำเร็จ");
      const res = await fetchWithToken<{
        bookings: Booking[];
        totalCount: number;
      }>(
        `/api/afterservice/order?status=${statusQuery}&page=${page}&limit=${limit}`,
        { method: "GET" }
      );

      if (!res.bookings || res.bookings.length === 0) {
        setMessage("ไม่มีประวัติการซ่อม");
        setBookings([]);
        setTotalCount(0);
      } else {
        setBookings(res.bookings);
        setTotalCount(res.totalCount);
        setMessage("");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching bookings:", err.message);
      setMessage("ไม่มีประวัติการซ่อม");
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithToken, page, limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

        setSelectedBooking(null);

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

  const totalPages = Math.ceil(totalCount / limit);

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
    <div className="flex flex-col gap-6">
      {bookings.map((order) => (
        <OrderCard
          key={`booking-${order.booking_id}`}
          orderCode={order.order_code}
          operationDateTime={new Date(order.service_date).toLocaleDateString()}
          employee={order.admin_name}
          items={order.items}
          status={order.status_name}
          totalPrice={order.total_price}
          detail={
            order.comment_rate ? "ได้แสดงความคิดเห็นแล้ว" : "แสดงความคิดเห็น"
          }
          onViewDetails={
            order.comment_rate ? undefined : () => setSelectedBooking(order)
          }
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            ก่อนหน้า
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            ถัดไป
          </button>
        </div>
      )}

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
