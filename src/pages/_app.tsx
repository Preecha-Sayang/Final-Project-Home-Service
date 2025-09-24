import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Prompt } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { useRouter } from "next/router";
import AdminShell from "@/pages/admin";

const fontPrompt = Prompt({
  //Set Font เพื่อใช้ทั้งระบบ ไม่ต้องลบส่วนนี้//
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: "600",
});

export default function App({ Component, pageProps }: AppProps) {
  
  //admin/** (ยกเว้น /admin/login)
  const router = useRouter();
  const path = router.pathname;
  const inAdmin = path.startsWith("/admin") && path !== "/admin/login";
  if (inAdmin) { 
    return (
      <AdminShell>
        <Component {...pageProps} />
      </AdminShell>
    );
  }
  //================================^

  return (
    <div className={fontPrompt.className}>
      <AuthProvider>
      <Component {...pageProps} />;
      </AuthProvider>
    </div>
  );
}

//const fetchWithToken = useFetchWithToken();
// const data = await fetchWithToken<UserData>("/api/protected/user");
