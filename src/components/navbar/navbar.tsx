import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import DropdownUser from "../dropdown/DropdownUser";
import user_default from "../../../public/images/user_default.png";
import Link from "next/link";
import { useEffect, useState } from "react";
import IconBell from "../button/iconbell";
import { useAuth } from "@/context/AuthContext";

type NavbarProps = {
  imageURL?: string;
};

export default function Navbar({ imageURL }: NavbarProps) {
  const getImageURL = imageURL === undefined ? user_default : imageURL;

  const [fullname, setFullname] = useState<string | undefined>(undefined);
  const { isLoggedIn, accessToken, refreshToken, login, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) return;
    fetch("/api/protected/protectapi", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setFullname(data?.fullname))
      .catch(() => {});
  }, [accessToken]);

  return (
    <div className="sticky top-0 z-40 bg-[var(--white)] shadow-md">
      <div className="mx-auto max-w-[1440px] h-[80px] bg-[var(--white)] flex items-center justify-between relative px-4 lg:px-15">
        {/* โลโก้ และ เมนู */}
        <div className="flex items-center gap-4 lg:gap-20">
          <Link href="/" className="cursor-pointer">
            <Image
              src={logo_img}
              alt="HomeServices"
              className="w-auto h-6 lg:h-9 "
              priority
              width={207}
              height={36}
            />
          </Link>

          {/* บริการของเรา - แสดงทั้งบนมือถือและเดสก์ท็อป */}
          <Link href="/service" className="cursor-pointer">
            <p className="flex items-center text-[var(--gray-900)] font-semibold mt-1.5 text-sm lg:text-base">
              บริการของเรา 
            </p>
          </Link>
        </div>

        {/* Auth Section - แสดงทั้งบนมือถือและเดสก์ท็อป */}
        <div className="flex items-center">
          {!isLoggedIn ? (
            <div>
              <Link
                href="/login"
                className="px-3 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer text-sm lg:text-base hover:bg-[var(--blue-50)] transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-4">
              {/* ซ่อนชื่อผู้ใช้บนมือถือ */}
              <div className="hidden lg:block text-gray-800 font-medium">
                {fullname}
              </div>
              <DropdownUser imageURL={getImageURL} fullname={fullname} />
              <IconBell />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * วิธีใช้งาน Navbar Component
 *
 * Navbar คือคอมโพเนนต์แถบนำทางด้านบนของเว็บแอปที่แสดงโลโก้ เมนู "บริการของเรา"
 * และส่วนผู้ใช้ (เข้าสู่ระบบ/โปรไฟล์ + กระดิ่งแจ้งเตือน) พร้อมรองรับหน้าจอมือถือ/เดสก์ท็อป
 *
 * นำเข้า:
 *   import Navbar from "@/components/navbar/navbar";
 *
 * การใช้งานพื้นฐาน:
 *   export default function Page() {
 *     return (
 *       <div>
 *         <Navbar />
 *         // เนื้อหาหน้าเพจ
 *       </div>
 *     );
 *   }
 *
 * Props:
 * - imageURL?: string
 *   URL รูปโปรไฟล์ที่จะส่งให้เมนูผู้ใช้ (`DropdownUser`).
 *   ถ้าไม่ระบุ จะใช้รูป default จาก `public/images/user_default.png`.
 *
 * การทำงานร่วมกับระบบล็อกอิน:
 * - คอมโพเนนต์นี้ใช้ `useAuth()` จาก `AuthContext` เพื่ออ่าน `isLoggedIn` และ `accessToken`.
 * - เมื่อมี `accessToken` จะเรียก `/api/protected/protectapi` เพื่อดึง `fullname` มาแสดง.
 * - ต้องครอบแอปด้วย `AuthProvider` ในระดับสูงของแอป (เช่นใน `_app.tsx`).
 *
 * เส้นทางลิงก์เริ่มต้น:
 * - โลโก้ -> "/"
 * - เมนู "บริการของเรา" -> "/service"
 * - ปุ่ม "เข้าสู่ระบบ" -> "/login"
 *
 * Responsive:
 * - ใช้ Tailwind จัดการขนาดและตัวอักษรบนมือถือ/เดสก์ท็อป (`text-sm lg:text-base`, `h-6 lg:h-9`).
 * - ชื่อผู้ใช้แสดงเฉพาะจอใหญ่ (`hidden lg:block`) เพื่อประหยัดพื้นที่บนมือถือ.
 */
