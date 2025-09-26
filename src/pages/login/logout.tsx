import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    } catch (e) {
      console.error(e);
    } finally {
      router.replace("/");
    }
  }, [router]);

  return null;
}