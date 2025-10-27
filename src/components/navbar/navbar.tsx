import logo_img from "../../../public/images/logo.png";
import Image from "next/image";
import DropdownUser from "../dropdown/DropdownUser";
import user_default from "../../../public/images/user_default.png";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import IconBell from "../button/iconbell";
import { useAuth } from "@/context/AuthContext";
import StatusListener from "../StatusListener";

interface Notification {
  booking_id: number;
  order_code: string;
  new_status: string;
}


export default function Navbar() {
  const { isLoggedIn, accessToken, user } = useAuth();
  // State สำหรับเก็บข้อมูลโปรไฟล์และอวาตาร์
  const [fullname, setFullname] = useState<string>("");
  const [avatarURL, setAvatarURL] = useState<string | typeof user_default>(
    user_default
  );

    // โหลด notifications จาก localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        const saved = localStorage.getItem(`notifications_${user.user_id}`);
        return saved ? JSON.parse(saved) : [];
      } catch (error) {
        console.error("Error loading notifications from localStorage:", error);
        return [];
      }
    }
    return [];
  });

    // บันทึก notifications ลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (user && notifications.length > 0) {
      try {
        localStorage.setItem(`notifications_${user.user_id}`, JSON.stringify(notifications));
      } catch (error) {
        console.error("Error saving notifications to localStorage:", error);
      }
    }
  }, [notifications, user]);

  // โหลด notifications จาก localStorage เมื่อ user login
  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`notifications_${user.user_id}`);
        if (saved) {
          setNotifications(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    }
  }, [user]);

    // เคลียร์ notifications เมื่อ logout
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
    }
  }, [isLoggedIn]);


  // ฟังก์ชันดึงข้อมูลโปรไฟล์
  const fetchProfile = useCallback(() => {
    if (!accessToken) {
      setFullname("");
      setAvatarURL(user_default);
      return;
    }

    // ดึงข้อมูลจาก API /api/profile
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setFullname(data.fullname || "");
          setAvatarURL(data.avatar || user_default);
        }
      })
      .catch(() => {
        setFullname("");
        setAvatarURL(user_default);
      });
  }, [accessToken]);

  // ดึงข้อมูลโปรไฟล์และอวาตาร์เมื่อมี accessToken
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ฟังการเปลี่ยนแปลงโปรไฟล์จาก custom event
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const { fullname: newFullname, avatar: newAvatar } = event.detail;
      if (newFullname) setFullname(newFullname);
      if (newAvatar) setAvatarURL(newAvatar);
    };

    window.addEventListener(
      "profileUpdated",
      handleProfileUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdate as EventListener
      );
    };
  }, []);

  const handleNewNotification = useCallback((data: Notification) => {
    // console.log("🔔 New notification in Navbar:", data);
    setNotifications((prev) => {
      const newList = [data, ...prev];
      // บันทึกลง localStorage ทันที
      if (user) {
        try {
          localStorage.setItem(`notifications_${user.user_id}`, JSON.stringify(newList));
        } catch (error) {
          console.error("Error saving notification:", error);
        }
      }
      return newList;
    });
  }, [user]);

  const clearNotifications = useCallback(() => {
    // console.log("🧹 Clearing all notifications");
    setNotifications([]);
    // ลบจาก localStorage
    if (user) {
      try {
        localStorage.removeItem(`notifications_${user.user_id}`);
      } catch (error) {
        console.error("Error clearing notifications:", error);
      }
    }
  }, [user])

  return (
    <div className="sticky top-0 z-40 bg-[var(--white)] shadow-md">
{isLoggedIn && user && (
  <StatusListener 
    userId={Number(user.user_id)} 
    onNewNotification={handleNewNotification} 
  />
)}
      <div className="mx-auto max-w-[1440px] h-[80px] bg-[var(--white)] flex items-center justify-between relative px-4 lg:px-15">
        {/* โลโก้ และ เมนู */}
        <div className="flex items-center gap-4 lg:gap-20">
          <Link href="/" className="cursor-pointer">
            <Image
              src={logo_img}
              alt="HomeServices"
              className="w-auto h-6 lg:h-9 object-contain"
              priority
              width={512}
              height={512}
              unoptimized={false}
            />
          </Link>

          {/* บริการของเรา - แสดงทั้งบนมือถือและเดสก์ท็อป */}
          <Link href="/services" className="cursor-pointer">
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
                className="px-3 py-2 border border-[var(--blue-600)] text-[var(--blue-600)] rounded-lg cursor-pointer text-sm lg:text-base hover:bg-[var(--blue-100)] transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-4">
              {/* ซ่อนชื่อผู้ใช้บนมือถือ */}
              <div className="hidden lg:block text-[var(--gray-700)] font-medium">
                {fullname}
              </div>
              <DropdownUser imageURL={avatarURL} fullname={fullname} />
                {user && (
                  <>
                    <IconBell
                      notifications={notifications}
                      onClear={clearNotifications}
                    />
                  </>
                )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

