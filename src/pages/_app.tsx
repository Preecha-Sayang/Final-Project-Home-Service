import "@/styles/globals.css";
import "rsuite/dist/rsuite-no-reset.min.css";
import type { AppProps } from "next/app";
import { Prompt } from "next/font/google";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  ProtectedRoute,
  AuthRoute,
} from "@/components/routeprotect/ProtectedRoute";
import { useRouter } from "next/router";
import AdminShell from "@/pages/admin";
import TechnicianShell from "@/components/technician/shell/TechnicianShell";
import { Toaster } from "react-hot-toast";
import StatusListener from "@/components/StatusListener";
import { useState } from "react";

const fontPrompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});


interface UserAppProps {
  Component: AppProps["Component"];
  pageProps: AppProps["pageProps"];
}

function UserApp({ Component, pageProps }: UserAppProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<
    { booking_id: number; new_status: string }[]
  >([]);

  const handleNewNotification = (data: { booking_id: number; new_status: string }) => {
    setNotifications(prev => [data, ...prev]);
  };

  return (
    <>
      {user && (
        <StatusListener
          userId={Number(user.user_id)}
          onNewNotification={handleNewNotification}
        />
      )}
      <Toaster position="bottom-right" />
      <Component {...pageProps} notifications={notifications} />
    </>
  );
}






export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const path = router.pathname;


  // กำหนดหน้าที่ต้อง login
  const protectedRoutes = [
    "/admin",
    "/afterservice",
    "/payment",
    "/technician",
    // เพิ่มหน้าอื่นๆ ที่ต้อง login ตรงนี้
  ];

  // กำหนดหน้า login/register (ล็อกอินแล้วเข้าไม่ได้)
  const authRoutes = ["/login", "/register", "/admin/login"];

  // ตรวจสอบว่าเป็นหน้าที่ต้อง login หรือไม่
  const isProtected =
    protectedRoutes.some((route) => path.startsWith(route)) &&
    path !== "/admin/login"; // ยกเว้น /admin/login

  // ตรวจสอบว่าเป็นหน้า auth หรือไม่
  const isAuthRoute = authRoutes.includes(path);

  // Admin pages (ยกเว้น /admin/login)
  const inAdmin = path.startsWith("/admin") && path !== "/admin/login";

  // Technician page
  const inTechnician = path.startsWith("/technician");

  if (inAdmin) {
    return (
      <div className={fontPrompt.className}>
        <AuthProvider>
          {/* <ProtectedRoute 
            redirectTo="/admin/login"
            popupTitle="กรุณาเข้าสู่ระบบ"
            popupMessage="คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้า Admin"
            allowCancel={false}
          > */}
          <AdminShell>
            <Component {...pageProps} />
          </AdminShell>
          {/* </ProtectedRoute> */}
        </AuthProvider>
      </div>
    );
  }

  if (inTechnician) {
    return (
      <div className={fontPrompt.className}>
        <AuthProvider>
          {/* สามารถเปิด ProtectedRoute ทีหลังได้เหมือน admin */}
          {/* <ProtectedRoute redirectTo="/login"> */}
          <TechnicianShell>
            <Component {...pageProps} />
          </TechnicianShell>
          {/* </ProtectedRoute> */}
        </AuthProvider>
      </div>
    );
  }

  // หน้าปกติ
  return (
    <div className={fontPrompt.className}>
      <AuthProvider>
        {/* ข้อความแจ้งเตือนให้อยู่ล่างขวา */}
        <Toaster position="bottom-right" />

        {isProtected ? (
          // หน้าที่ต้อง login
          <ProtectedRoute>
            <UserApp Component={Component} pageProps={pageProps} />
          </ProtectedRoute>
        ) : isAuthRoute ? (
          // หน้า login/register (ล็อกอินแล้วเข้าไม่ได้)
          <AuthRoute>
            <UserApp Component={Component} pageProps={pageProps} />
          </AuthRoute>
        ) : (
          // หน้าสาธารณะ (ไม่ต้อง login)
          <UserApp Component={Component} pageProps={pageProps} />
        )}
      </AuthProvider>
    </div>
  );
}
//const fetchWithToken = useFetchWithToken();
// const data = await fetchWithToken<UserData>("/api/protected/user");
