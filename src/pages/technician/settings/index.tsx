import { useEffect, useMemo, useState } from "react";
import PageToolbar from "@/components/technician/common/PageToolbar";
import ButtonSecondary from "@/components/button/buttonsecondary";
import ButtonPrimary from "@/components/button/buttonprimary";
import Checkbox from "@/components/radio/check_box";
import GoogleLocationPickerModal from "@/components/location/GoogleLocationPickerModal";
import { reverseGeocode, formatThaiAddress } from "lib/client/maps/googleProvider";
import { useTechnicianLocation } from "@/stores/geoStore";
import Swal from "sweetalert2";

import { useGeolocation } from "@/hooks/useGeolocation";
function toGeoPosition(p: { lat: number; lng: number; accuracy?: number }): GeolocationPosition {
  const obj = {
    coords: {
      latitude: p.lat,
      longitude: p.lng,
      accuracy: p.accuracy ?? 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
    toJSON() { return this as unknown as GeolocationPosition; },
  };
  return obj as unknown as GeolocationPosition;
}

type ServiceRow = {
  service_id: number;
  servicename: string;
};

function toServiceRow(x: unknown): ServiceRow | null {
  if (typeof x !== "object" || x === null) return null;
  const r = x as Record<string, unknown>;
  const id = Number(r["service_id"]);
  if (!Number.isFinite(id)) return null;
  const name =
    typeof r["servicename"] === "string"
      ? r["servicename"]
      : String(r["servicename"] ?? "");
  return { service_id: id, servicename: name };
}

export default function TechnicianCombinedSettingsPage() {
  // จัดเก็บข้อมูลฟอร์มทั่วไป / General form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  // สถานะความพร้อมให้บริการ / Availability status
  const [isAvailable, setIsAvailable] = useState(true);

  // รายการบริการทั้งหมด และบริการที่เลือก / All services & selected services
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<number>>(new Set());

  // Store สำหรับข้อมูลตำแหน่งช่าง / Technician location store
  const { addressText, coords, loading, loadFromServer, reverseAndSave } = useTechnicianLocation();
  const { getPositionOnce } = useGeolocation();

  // สถานะเปิด/ปิด modal เลือกตำแหน่ง / Location picker modal open state
  const [openPicker, setOpenPicker] = useState(false);

  // แปลง Set เป็น Array สำหรับส่ง API / Convert selected IDs to array for API
  const selectedIdsArray = useMemo(() => Array.from(selectedServiceIds), [selectedServiceIds]);

  useEffect(() => {
    // โหลดข้อมูลเริ่มต้น: ตำแหน่งปัจจุบัน, รายการบริการ, โปรไฟล์ / Load initial data: location, services, and profile
    void loadFromServer();

    const loadData = async () => {
      try {
        // ดึงข้อมูลบริการและโปรไฟล์พร้อมกัน / Fetch services and profile in parallel
        const [svcRes, profRes] = await Promise.all([
          fetch("/api/services", { credentials: "include" }),
          fetch("/api/technician/profile", { credentials: "include" }),
        ]);
        const svcJson = await svcRes.json();
        const profJson = await profRes.json();

        // แปลงผลลัพธ์บริการ / Normalize services data
        const svcList: unknown[] = Array.isArray(svcJson)
          ? svcJson
          : Array.isArray(svcJson.services)
            ? svcJson.services
            : [];
        const normalized: ServiceRow[] = (svcList as unknown[])
          .map(toServiceRow)
          .filter((v): v is ServiceRow => v !== null);
        setServices(normalized);

        // โหลดข้อมูลโปรไฟล์ / Load technician profile
        if (profJson?.ok && profJson.profile) {
          const p = profJson.profile as {
            first_name?: string | null;
            last_name?: string | null;
            phone?: string | null;
            is_available?: boolean;
            service_ids?: number[];
            address_text?: string;
          };
          setFormData((prev) => ({
            ...prev,
            firstName: (p.first_name ?? "").toString(),
            lastName: (p.last_name ?? "").toString(),
            phone: (p.phone ?? "").toString(),
            address: p.address_text ?? "",
          }));
          setIsAvailable(Boolean(p.is_available ?? true));
          const ids = Array.isArray(p.service_ids)
            ? (p.service_ids.filter((n: unknown) => Number.isInteger(n)) as number[])
            : [];
          setSelectedServiceIds(new Set(ids));
        }
      } catch (e) {
        console.error(e);
      }
    };

    void loadData();
  }, [loadFromServer]);

  useEffect(() => {
    // อัปเดตฟิลด์ address หากตำแหน่งใน store เปลี่ยน / Sync address field when store changes
    if (addressText) {
      setFormData((prev) => ({ ...prev, address: addressText }));
    }
  }, [addressText]);

  // อัปเดตค่า input / Update input field values
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // เปลี่ยนสถานะ checkbox ของบริการ / Toggle service checkbox
  const toggleService = (id: number) => (checked: boolean) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  //  ยกเลิกและรีเฟรชหน้า / Cancel and reload page
  const handleCancel = () => {
    window.location.reload();
  };

  // ยืนยันและบันทึกข้อมูล / Confirm and save data
  const handleConfirm = async () => {
    try {
      const payload = {
        name: [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        is_available: isAvailable,
        service_ids: selectedIdsArray,
      };

      const res = await fetch("/api/technician/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const js = await res.json();
      if (!res.ok || !js?.ok) throw new Error(js?.message || `Save failed: ${res.status}`);

      // แสดง popup สำเร็จ
      await Swal.fire({
        title: "บันทึกข้อมูลสำเร็จ!",
        text: "ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    } catch (e) {
      console.error(e);

      // แสดง popup error
      await Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  };

  //  ตัวจัดการเลือกตำแหน่งบนแผนที่ / Handlers for map picker
  type SelectedLocation = { point: { lat: number; lng: number }; place_name?: string };

  const saveSelected = async (v: SelectedLocation) => {
    const { lat, lng } = v.point;
    const rev = await reverseGeocode(lat, lng);
    const pretty = formatThaiAddress(rev?.fullText || v.place_name || `${lat}, ${lng}`, rev?.meta);

    const r = await fetch("/api/technician/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lat, lng, address_text: pretty, meta: rev?.meta }),
    });
    const js: { ok: boolean } = await r.json();
    if (!js?.ok) {
      alert("บันทึกตำแหน่งไม่สำเร็จ");
      return;
    }
    await loadFromServer();
    setFormData((prev) => ({ ...prev, address: pretty }));
  };

  // กำหนดค่าตั้งต้นของตัวเลือกแผนที่ / Set initial value for location picker
  const initialPicker = useMemo(() => {
    return coords ? { point: coords, place_name: addressText || undefined } : undefined;
  }, [coords, addressText]);

  // ปุ่ม "รีเฟรช" ในหน้า settings: ใช้ตำแหน่งปัจจุบันจริง (เหมือนหน้า inbox)
  const onRefreshCurrent = async () => {
    try {
      const p = await getPositionOnce(); // { lat, lng }
      await reverseAndSave(async () =>
        toGeoPosition({ lat: p.lat, lng: p.lng, accuracy: 5 })
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <>
      {/* Toolbar ด้านบน / Top page toolbar */}
      <PageToolbar
        title="ตั้งค่าบัญชีผู้ใช้"
        rightSlot={
          <div className="flex flex-row sm:flex-row gap-2 sm:gap-6 w-full sm:w-auto">
            <ButtonSecondary
              onClick={handleCancel}
              className="w-full sm:w-auto sm:min-w-[120px] px-4 py-1.5 text-sm"
            >
              ยกเลิก
            </ButtonSecondary>

            <ButtonPrimary
              onClick={handleConfirm}
              className="w-full sm:w-auto sm:min-w-[120px] px-4 py-1.5 text-sm"
            >
              ยืนยัน
            </ButtonPrimary>
          </div>
        }
      />

      <div className="p-4 md:p-8 bg-[var(--gray-50)] min-h-screen">
        <div className="bg-[var(--white)] rounded-xl shadow-sm p-4 md:p-8 space-y-6 md:space-y-10">
          {/* รายละเอียดบัญชี / Account Details Section */}
          <section>
            <div className="text-xl font-semibold text-[var(--gray-900)] mb-6">รายละเอียดบัญชี</div>

            <div className="flex flex-col gap-3 ">
              {/* First Name */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                  ชื่อ<span className="text-[var(--red)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  placeholder="กรุณากรอกชื่อ"
                  className="cursor-pointer w-full md:w-[400px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                  นามสกุล<span className="text-[var(--red)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  placeholder="กรุณากรอกนามสกุล "
                  className="cursor-pointer w-full md:w-[400px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                  เบอร์ติดต่อ<span className="text-[var(--red)]">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange("phone")}
                  placeholder="กรุณากรอกเบอร์ติดต่อ"
                  className="cursor-pointer w-full md:w-[400px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                />
              </div>

              {/* Address */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <label className="text-m font-medium text-[var(--gray-700)] whitespace-nowrap w-full md:w-[200px]">
                  ตำแหน่งที่อยู่ปัจจุบัน<span className="text-[var(--red)]">*</span>
                </label>
                <input
                  className="cursor-pointer w-full md:w-[400px] border border-[var(--gray-300)] rounded-lg px-3 py-2 text-m text-[var(--gray-900)] focus:outline-none focus:ring-2 focus:ring-[var(--blue-300)]"
                  value={loading ? "กำลังดึงข้อมูล…" : addressText || "—"}
                  disabled
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefreshCurrent}
                  className="w-[96px] h-[36px] rounded-lg font-medium  border-2 border-[var(--blue-300)] text-[var(--blue-700)] hover:bg-[var(--blue-100)] cursor-pointer transition"
                >
                  {loading ? "กำลังรีเฟรช…" : "รีเฟรช"}
                </button>
              </div>
            </div>
          </section>

          <hr className="border-b border-[var(--gray-200)]" />

          {/* สถานะบัญชี / Account Status Section */}
          <section>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="text-xl font-semibold text-[var(--gray-900)] w-full md:w-[200px]">
                สถานะบัญชี
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`cursor-pointer w-16 h-8 rounded-full p-1 flex items-center transition-all duration-300 ${isAvailable ? "bg-[var(--blue-500)] justify-end" : "bg-[var(--gray-300)] justify-start"
                  }`}
              >
                <div className="cursor-pointer h-6 w-6 bg-[var(--white)] rounded-full shadow-md transition-transform duration-300"></div>
              </button>

              <div className="text-base font-medium text-[var(--gray-900)]">พร้อมให้บริการ</div>
            </div>
            <div className="flex items-center gap-4 ">
              <div className="w-[200px]"></div>
              <div className="w-16"></div>
              <div className="text-sm text-[var(--gray-600)]">
                ระบบจะแสดงคำสั่งซ่อมในบริเวณใกล้เคียงตำแหน่งที่อยู่ปัจจุบัน ให้สามารถเลือกรับงานได้
              </div>
            </div>
          </section>

          <hr className="border-b border-[var(--gray-200)] " />

          {/* บริการที่รับซ่อม / Service Selection Section */}
          <section>
            <div className="flex flex-col md:flex-row">
              <div className="text-xl font-semibold text-[var(--gray-900)] w-full md:w-[220px] mb-6">
                บริการที่รับซ่อม
              </div>
              <div className="flex flex-col gap-2 ">
                {services.map((svc) => (
                  <Checkbox
                    key={svc.service_id}
                    id={`service-${svc.service_id}`}
                    checked={selectedServiceIds.has(svc.service_id)}
                    onChange={toggleService(svc.service_id)}
                    label={svc.servicename}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal เลือกตำแหน่ง / Map Picker Modal */}
      <GoogleLocationPickerModal
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        initial={initialPicker}
        onConfirm={(v) => { void saveSelected(v); setOpenPicker(false); }}
      />
    </>
  );
}
