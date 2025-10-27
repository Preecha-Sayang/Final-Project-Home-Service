import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

type ProtectedRouteProps = {
  children: ReactNode;
  role: "admin" | "technician";
};

export const AdminProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // ✅ ป้องกัน Hydration Error
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkLogin = async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        const data = await res.json();

        // ❌ ไม่ได้ login
        if (!data.admin) {
          await Swal.fire({
            icon: "warning",
            title: "กรุณาเข้าสู่ระบบก่อน",
            confirmButtonText: "ตกลง",
          });
          router.replace("/admin/login");
          return;
        }

        // ⚠️ login แล้วแต่ role ไม่ตรง
        if (data.admin.role !== role) {
          await Swal.fire({
            icon: "error",
            title: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
            confirmButtonText: "กลับหน้าเข้าสู่ระบบ",
          });
          router.replace("/admin/login");
          return;
        }

        // ✅ ผ่านการตรวจสอบ
        setLoading(false);
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        });
        router.replace("/admin/login");
      }
    };

    checkLogin();
  }, [mounted, router, role]);

  if (!mounted || loading) return ( <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50"> <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div> <p className="text-gray-600 text-lg font-medium">Loading...</p> </div> );
  return <>{children}</>;
};

// ===========================================
// 🔹 หน้า Login (ห้ามเข้าถ้า login แล้ว)
// ===========================================
type AuthRouteProps = { children: ReactNode };

export const AdminAuthRoute = ({ children }: AuthRouteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkLogin = async () => {
      try {
        const res = await fetch("/api/admin/me", { credentials: "include" });
        const data = await res.json();

        // ✅ ถ้า login แล้ว ห้ามเข้าหน้า /admin/login
        if (data.admin) {
          await Swal.fire({
            icon: "info",
            title: "คุณได้เข้าสู่ระบบอยู่แล้ว",
            confirmButtonText: "ไปหน้า Dashboard",
          });

          if (data.admin.role === "admin") {
            router.replace("/admin/categories");
          } else if (data.admin.role === "technician") {
            router.replace("/technician");
          }
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    checkLogin();
  }, [mounted, router]);

  if (!mounted || loading) return ( <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50"> <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div> <p className="text-gray-600 text-lg font-medium">Loading...</p> </div> );
  return <>{children}</>;
};
