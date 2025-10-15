
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showPopup?: boolean;
  popupTitle?: string;
  popupMessage?: string;
  popupIcon?: "warning" | "error" | "info" | "question";
  allowCancel?: boolean; // อนุญาตให้กดยกเลิกหรือไม่
  cancelButtonText?: string;
  confirmButtonText?: string;
}

// ProtectedRoute - สำหรับหน้าที่ต้องล็อกอินก่อน
export const ProtectedRoute = ({ 
  children, 
  redirectTo = "/login",
  showPopup = true,
  popupTitle = "กรุณาเข้าสู่ระบบ",
  popupMessage = "คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้",
  popupIcon = "warning",
  allowCancel = true,
  cancelButtonText = "ย้อนกลับ",
  confirmButtonText = "เข้าสู่ระบบ"
}: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      if (showPopup) {
        // แสดง SweetAlert2
        Swal.fire({
          title: popupTitle,
          text: popupMessage,
          icon: popupIcon,
          showCancelButton: allowCancel,
          confirmButtonText: confirmButtonText,
          cancelButtonText: cancelButtonText,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            // กดปุ่มยืนยัน -> ไปหน้า login
            router.replace(redirectTo);
          } else if (result.isDismissed) {
            // กดยกเลิก -> ย้อนกลับ
            router.back();
          }
        });
      } else {
        // ไม่แสดง popup -> redirect ทันที
        router.replace(redirectTo);
      }
    }
  }, [isLoggedIn, router, redirectTo, showPopup, popupTitle, popupMessage, popupIcon, allowCancel, cancelButtonText, confirmButtonText]);

  // ถ้ายังไม่ล็อกอิน แสดง loading
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// AuthRoute - สำหรับหน้า login/register
export const AuthRoute = ({ 
  children,
  redirectTo = "/",
  showPopup = false,
  popupTitle = "คุณเข้าสู่ระบบแล้ว",
  popupMessage = "คุณได้เข้าสู่ระบบแล้ว กำลังนำคุณไปหน้าหลัก",
  popupIcon = "info"
}: ProtectedRouteProps) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      if (showPopup) {
        Swal.fire({
          title: popupTitle,
          text: popupMessage,
          icon: popupIcon,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        }).then(() => {
          router.replace(redirectTo);
        });
      } else {
        router.replace(redirectTo);
      }
    }
  }, [isLoggedIn, router, redirectTo, showPopup, popupTitle, popupMessage, popupIcon]);

  if (isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};