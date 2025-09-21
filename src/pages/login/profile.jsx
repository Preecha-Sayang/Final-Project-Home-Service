import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ButtonPrimary from "@/components/button/buttonprimary";
import Navbar from "@/components/navbar/navbar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        setError("กรุณาเข้าสู่ระบบอีกครั้ง");
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (error) return <p className="text-red-500 p-4">{error}</p>;
  if (!user) return <p className="p-4">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen flex flex-col items-center pt-20 bg-gray-50">
        <div className="w-[610px] bg-white border border-gray-200 rounded-lg flex flex-col justify-center items-start p-8 shadow-md">
          <span className="font-bold text-3xl text-blue-900 mb-6">ข้อมูลผู้ใช้</span>

          <p><b>ID:</b> {user.user_id}</p>
          <p><b>ชื่อ:</b> {user.fullname}</p>
          <p><b>อีเมล:</b> {user.email}</p>
          <p><b>เบอร์โทร:</b> {user.phone_number}</p>
          <p><b>สมัครเมื่อ:</b> {new Date(user.create_at).toLocaleString()}</p>

          <ButtonPrimary
            onClick={handleLogout}
            className="mt-6 w-full py-3"
          >
            <span>ออกจากระบบ</span>
          </ButtonPrimary>
        </div>
      </div>
    </>
  );
}