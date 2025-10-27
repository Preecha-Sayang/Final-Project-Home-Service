import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import axios from "axios";
import dynamic from "next/dynamic";
import type { GeoPoint } from "@/types/location";

// โหลดแผนที่แบบ client-only (เหมือนหน้า pending)
const GoogleMapRouteView = dynamic(
  () => import("@/components/location/GoogleMapRouteView"),
  { ssr: false }
);

interface PinnedLoc {
  lat: number;
  lng: number;
  place_name?: string | null;
}

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
  comment_rate: number;
  comment_text: string;
  // ให้มีเสมอหลังจาก normalize
  pinned_location?: PinnedLoc | null;
}

// ----- helpers: แปลงค่าพิกัดให้เป็นเลขเสมอ และรองรับหลายฟอร์แมต -----
function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function parsePinned(obj: unknown): PinnedLoc | null {
  if (!obj) return null;

  // กรณี backend ส่งมาเป็นสตริง JSON
  if (typeof obj === "string") {
    try {
      const parsed = JSON.parse(obj) as unknown;
      return parsePinned(parsed);
    } catch {
      return null;
    }
  }

  // กรณีเป็นอ๊อบเจ็กต์ที่มี lat/lng
  if (typeof obj === "object") {
    const o = obj as { lat?: unknown; lng?: unknown; place_name?: string | null };
    const lat = toNum(o.lat);
    const lng = toNum(o.lng);
    if (lat != null && lng != null) {
      return { lat, lng, place_name: o.place_name ?? null };
    }
  }
  return null;
}

function normalizePinned(locationField: unknown, pinnedLat?: unknown, pinnedLng?: unknown): PinnedLoc | null {
  const byField = parsePinned(locationField);
  if (byField) return byField;

  const lat = toNum(pinnedLat);
  const lng = toNum(pinnedLng);
  return lat != null && lng != null ? { lat, lng, place_name: null } : null;
}
// ----------------------------------------------------------------------

function Hisrotyimformation() {
  const router = useRouter();
  const { id } = router.query;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // state สำหรับ popup แผนที่ (เหมือนหน้า pending)
  const [mapOpen, setMapOpen] = useState(false);
  const [resolvedDest, setResolvedDest] = useState<{ point: GeoPoint; name: string } | null>(null);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/technician/history/${id}`);

        // ดึงค่าที่อาจมาได้หลายแบบแล้ว normalize เป็น pinned_location เดียว
        const raw = res.data.booking as Record<string, unknown>;
        const pinned = normalizePinned(
          raw.pinned_location,     // อาจเป็น JSON/อ็อบเจ็กต์
          raw.pinned_lat,          // หรือ lat/lng แยกฟิลด์
          raw.pinned_lng
        );

        const next: Booking = {
          service_name: String(raw.service_name ?? ""),
          category: String(raw.category ?? ""),
          items: String(raw.items ?? ""),
          service_date: String(raw.service_date ?? ""),
          service_time: String(raw.service_time ?? ""),
          address: String(raw.address ?? ""),
          order_code: String(raw.order_code ?? ""),
          total_price: Number(raw.total_price ?? 0),
          customer_name: String(raw.customer_name ?? ""),
          customer_phone: String(raw.customer_phone ?? ""),
          comment_rate: Number(raw.comment_rate ?? 0),
          comment_text: String(raw.comment_text ?? ""),
          pinned_location: pinned,
        };

        setBooking(next);
      } catch (err) {
        console.error(err);
        console.error("Error fetching bookings:", err);
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // ตำแหน่งต้นทาง (ช่าง) เหมือนหน้า pending
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setOrigin({ lat: 13.736717, lng: 100.523186 }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setOrigin({ lat: 13.736717, lng: 100.523186 });
    }
  }, []);

  const hasPinned = useMemo(() => {
    const p = booking?.pinned_location ?? null;
    return !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng);
  }, [booking?.pinned_location]);

  const openMap = () => {
    if (!booking || !hasPinned) return;
    const p = booking.pinned_location as PinnedLoc;
    setResolvedDest({
      point: { lat: p.lat, lng: p.lng },
      name: booking.address || "ปลายทาง",
    });
    setMapOpen(true);
  };

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
            <Image src="/images/Frame.svg" alt="back-icon" width={40} height={40} />
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
              {booking.items.split(",").map((item: string, index: number) => (
                <p key={index} className="text-[16px] font-medium">{item.trim()}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-row">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              วันเวลาที่ดำเนินการ
            </p>
            <p className="text-[16px] font-medium">
              {booking.service_date} เวลา {booking.service_time.substring(0, 5)} น.
            </p>
          </div>

          <div className="flex flex-row ">
            <p className="w-[120px] md:w-[250px] mr-[15px] md:mr-[25px] flex-shrink-0 text-[16px] font-medium text-[var(--gray-700)]">
              สถานที่
            </p>
            <div>
              <p className="text-[16px] font-medium">{booking.address}</p>
              {/* ปุ่มดูแผนที่: ถ้ามีพิกัดจะกดได้; ถ้าไม่มี = สีเทาเหมือนหน้า pending */}
              <div className="mt-1">
                {hasPinned ? (
                  <button
                    type="button"
                    onClick={openMap}
                    className="inline-flex items-center gap-1 underline underline-offset-2 text-[var(--blue-700)] cursor-pointer"
                    title="ดูแผนที่"
                  >
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="currentColor" strokeWidth={1.5} />
                    </svg>
                    ดูแผนที่
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-gray-400 select-none" title="ไม่มีพิกัดปลายทาง">
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" stroke="currentColor" strokeWidth={1.5} />
                    </svg>
                    ดูแผนที่
                  </span>
                )}
              </div>
            </div>
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
              {Number(booking.total_price).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
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
                i <= (booking.comment_rate || 0) ? (
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
            <p className="text-[16px] font-medium">{booking.comment_text || "-"}</p>
          </div>
        </div>
      </div>

      {/* Popup แผนที่ */}
      {mapOpen && resolvedDest && (
        <GoogleMapRouteView
          key={booking.order_code}
          open={mapOpen}
          onClose={() => {
            setMapOpen(false);
            setResolvedDest(null);
          }}
          origin={{ lat: origin?.lat ?? 13.736717, lng: origin?.lng ?? 100.523186 }}
          destination={resolvedDest.point}
          destinationName={resolvedDest.name}
        />
      )}
    </div>
  );
}

export default Hisrotyimformation;
