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
import Script from "next/script";

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

  // กำหนดหน้าที่ต้อง login
  const protectedRoutes = [
    "/admin",
    "/afterservice",
    "/payment",
    "/technician",
  ];

  const authRoutes = ["/login", "/register", "/admin/login"];

  const isProtected =
    protectedRoutes.some((route) => path.startsWith(route)) &&
    path !== "/admin/login";

  const isAuthRoute = authRoutes.includes(path);
  const inAdmin = path.startsWith("/admin") && path !== "/admin/login";
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

  if (inAdmin) {
    return (
      <div className={fontPrompt.className}>
        {GoogleMapsScript}
        <AuthProvider>
          <AdminShell>
            <Component {...pageProps} />
          </AdminShell>
        </AuthProvider>
      </div>
    );
  }

  if (inTechnician) {
    return (
      <div className={fontPrompt.className}>
        {GoogleMapsScript}
        <AuthProvider>
          <TechnicianShell>
            <Component {...pageProps} />
          </TechnicianShell>
        </AuthProvider>
      </div>
    );
  }

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
