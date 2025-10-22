import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";

interface Booking {
  service_name: string;
  category: string;
  items: string;
  service_date: string;
  service_time: string;
  address: string;
  order_code: string;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  rating: number;
  comment: string;
}

function Hisrotyimformation() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/technician/history/${id}`);
        setBooking(res.data.booking);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!booking) return <p className="p-4">ไม่พบข้อมูลการจอง</p>;

  return (
    <div>
      <div className="w-full md:h-[80px] border-b border-[var(--gray-200)] bg-white">
        <div className="flex flex-row items-center gap-3 h-full p-[15px]">
          <div
            className="flex items-center justify-center w-[40px] h-[40px] hover:cursor-pointer"
            onClick={() => router.push("/technician/history")}
          >
            <Image
              src="/images/Frame.svg"
              alt="back-icon"
              width={40}
              height={40}
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[12px] font-medium text-[var(--gray-700)]">ประวัติการซ่อม</p>
            <p className="text-[20px] font-medium text-[var(--gray-950)]">{booking.service_name}</p>
          </div>
        </div>
      </div>

      <div className="m-[15px] md:m-[40px] border border-[var(--gray-200)] bg-white p-[20px] px-[25px] py-[30px]">
        <div className="flex flex-col gap-[40px]">
          <p className="text-[20px] font-medium">{booking.service_name}</p>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              หมวดหมู่
            </p>
            <div className="px-[10px] py-[5px] bg-[var(--blue-100)] rounded-2xl">
              <p className="text-[12px] font-medium text-[var(--blue-800)]">{booking.category}</p>
            </div>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              รายการ
            </p>
            <div className="flex flex-col gap-[10px]">
              {booking.items
              .split(",")
              .map((item: string, index: number) => (
                <p key={index} className="text-[16px] font-medium">{item.trim()}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              วันเวลาที่ดำเนินการ
            </p>
            <p className="text-[16px] font-medium">
            {booking.service_date} เวลา{" "}
              {booking.service_time.substring(0, 5)} น.
            </p>
          </div>

          <div className="flex flex-row ">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              สถานที่
            </p>
            <p className="text-[16px] font-medium">{booking.address}</p>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              รหัสคำสั่งซ่อม
            </p>
            <p className="text-[16px] font-medium">{booking.order_code}</p>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              ราคารวม
            </p>
            <p className="text-[16px] font-medium">
              {Number(booking.total_price).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ฿
            </p>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              ผู้รับบริการ
            </p>
            <p className="text-[16px] font-medium">{booking.customer_name}</p>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              เบอร์โทรติดต่อ
            </p>
            <p className="text-[16px] font-medium">{booking.customer_phone}</p>
          </div>

          <div className="border-b-2 border-[var(--gray-200)]"></div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              คะแนนความพึงพอใจ
            </p>
            <div className="flex flex-row gap-[5px]">
              {[1, 2, 3, 4, 5].map((i) =>
                i <= (booking.rating || 0) ? (
                  <AiFillStar key={i} size={24} className="text-[var(--blue-600)]" />
                ) : (
                  <AiOutlineStar key={i} size={24} className="text-[var(--blue-600)]" />
                )
              )}
            </div>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              ความคิดเห็นจากผู้รับบริการ
            </p>
            <p className="text-[16px] font-medium">{booking.comment || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hisrotyimformation;
