import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import { useState } from "react";
import { useRouter } from "next/router";

function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // เก็บ JWT ใน localStorage
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        setError(data.error || "Login ล้มเหลว");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <Navbar token="sdfs" fullname="sdfs" />
      <div className="w-full h-full flex justify-center items-center mt-12">
        <div className="w-[610px] border rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
          <span className="font-bold text-[32px] text-[var(--blue-950)] mb-6">
            เข้าสู่ระบบ
          </span>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form className="w-[440px] flex flex-col gap-4" onSubmit={handleSubmit}>
            <InputField
              label="อีเมล"
              placeholder="กรุณากรอกอีเมล"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <InputField
              label="รหัสผ่าน"
              type="password"
              placeholder="กรุณากรอกรหัสผ่าน"
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <ButtonPrimary type="submit" className="w-full py-3">
              <span>เข้าสู่ระบบ</span>
            </ButtonPrimary>
          </form>

          <div className="flex flex-row gap-1 mt-4">
            <span>ยังไม่มีบัญชีผู้ใช้ HomeService?</span>
            <ButtonGhost onClick={() => router.push("/login/register")}>
              <span>ลงทะเบียน</span>
            </ButtonGhost>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;


