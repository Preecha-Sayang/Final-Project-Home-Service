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
  total_price: number;
  discount: number;
  promo_code: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(4);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const statusQuery = encodeURIComponent("รอดำเนินการ,ดำเนินการอยู่");
      const res = await fetchWithToken<{
        bookings: Booking[];
        totalCount: number;
      }>(`/api/afterservice/order?status=${statusQuery}&page=${page}&limit=${limit}`, {
        method: "GET",
      });

      if (!res.bookings || res.bookings.length === 0) {
        setMessage("ไม่มีข้อมูลการซ่อม");
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
      setMessage("ไม่มีข้อมูลการซ่อม");
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithToken, page, limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg">
            <PaymentSummary
              status="ชำระเงินเรียบร้อย !"
              items={selectedBooking.items}
              date={selectedBooking.service_date ? new Date(selectedBooking.service_date) : undefined}
              time={selectedBooking.service_time}
              address={selectedBooking.address}
              totalPrice={selectedBooking.total_price}
              discount={selectedBooking.discount}
              promoCode={selectedBooking.promo_code}
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
