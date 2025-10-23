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
  allowCancel?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

// ✅ ProtectedRoute
export const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  showPopup = true,
  popupTitle = "กรุณาเข้าสู่ระบบ",
  popupMessage = "คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้",
  popupIcon = "warning",
  allowCancel = true,
  cancelButtonText = "ย้อนกลับ",
  confirmButtonText = "เข้าสู่ระบบ",
}: ProtectedRouteProps) => {
  const { isLoggedIn, loading , isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isLoggingOut) return;
    if (!loading && !isLoggedIn) {
      if (showPopup) {
        Swal.fire({
          title: popupTitle,
          text: popupMessage,
          icon: popupIcon,
          showCancelButton: allowCancel,
          confirmButtonText,
          cancelButtonText,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) router.replace(redirectTo);
          else if (result.isDismissed) router.back();
        });
      } else {
        router.replace(redirectTo);
      }
    }
  }, [loading, isLoggedIn, router, redirectTo,isLoggingOut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return <>{children}</>;
};

// ✅ AuthRoute
export const AuthRoute = ({
  children,
  redirectTo = "/",
  showPopup = false,
  popupTitle = "คุณเข้าสู่ระบบแล้ว",
  popupMessage = "กำลังนำคุณไปหน้าหลัก...",
  popupIcon = "info",
}: ProtectedRouteProps) => {
  const { isLoggedIn, loading,isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || isLoggingOut) return;
    if (!loading && isLoggedIn) {
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
  }, [loading, isLoggedIn, router, redirectTo,isLoggingOut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบ...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return <>{children}</>;
};
