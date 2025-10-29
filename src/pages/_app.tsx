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
import Script from "next/script";
import { useEffect, useState } from "react";
import { AdminProtectedRoute, AdminAuthRoute } from "@/components/routeprotect/Protectadmin";

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
    setNotifications((prev) => [data, ...prev]);
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
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const shouldLoadMaps = path.startsWith("/technician") || path.startsWith("/admin");

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ✅ Admin routes
  const inAdminLogin = path === "/admin/login";
  const inAdmin = path.startsWith("/admin") && !inAdminLogin;

  // Technician page
  const inTechnician = path.startsWith("/technician");

  const GoogleMapsScript = shouldLoadMaps && googleMapsKey ? (
    <Script
      id="gmaps-sdk"
      src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places,marker&language=th&region=TH&loading=async`}
      strategy="afterInteractive"
      onLoad={() => console.log("Google Maps SDK loaded")}
      onError={(e) => console.error("โหลด Google Maps SDK ไม่สำเร็จ", e)}
    />
  ) : null;

  // 🔒 หน้า login admin (กันไม่ให้คนที่ login แล้วเข้ามา)
  if (inAdminLogin) {
    return (
      <div className={fontPrompt.className}>
        <AdminAuthRoute>
          <Component {...pageProps} />
        </AdminAuthRoute>
      </div>
    );
  }

  // 🔐 หน้า Admin (ต้อง login และ role = admin)
  if (inAdmin) {
    return (
      <div className={fontPrompt.className}>
        {GoogleMapsScript}
        <AdminProtectedRoute role="admin">
          <AdminShell>
            <Component {...pageProps} />
          </AdminShell>
        </AdminProtectedRoute>
      </div>
    );
  }

  // 🔐 หน้า Technician (ต้อง login และ role = technician)
  if (inTechnician) {
    return (
      <div className={fontPrompt.className}>
        {GoogleMapsScript}
        <AdminProtectedRoute role="technician">
          <TechnicianShell>
            <Component {...pageProps} />
          </TechnicianShell>
        </AdminProtectedRoute>
      </div>
    );
  }

  // 👤 หน้าปกติ (User)
  const protectedRoutes = ["/afterservice", "/payment"];
  const authRoutes = ["/login", "/register"];
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.includes(path);

  return (
    <div className={fontPrompt.className}>
      {GoogleMapsScript}
      <AuthProvider>
        <Toaster position="bottom-right" />
        {isProtected ? (
          <ProtectedRoute>
            <UserApp Component={Component} pageProps={pageProps} />
          </ProtectedRoute>
        ) : isAuthRoute ? (
          <AuthRoute>
            <UserApp Component={Component} pageProps={pageProps} />
          </AuthRoute>
        ) : (
          <UserApp Component={Component} pageProps={pageProps} />
        )}
      </AuthProvider>
    </div>
  );
}