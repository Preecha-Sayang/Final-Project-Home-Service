import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import logo_img from "../../../public/images/logo.png";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // เก็บ JWT ใน localStorage
        localStorage.setItem("token", data.token);
        router.push("/admin/");
      } else {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <div className="w-full h-full flex flex-wrap justify-center items-center mt-28">
        <Image src={logo_img} alt="HomeServices" className="" />
        <div className="w-full h-full flex justify-center items-center mt-10">
          <div className="w-[550px] h-[450px] border rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
            <p className="font-bold text-[32px] text-[var(--blue-950)] mb-6">
              เข้าสู่ระบบแอดมิน
            </p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form
              className="w-[440px] max-w-full flex flex-col space-y-5"
              onSubmit={handleSubmit}
            >
              <InputField
                label={
                  <>
                    Email<span className="text-red-500">*</span>
                  </>
                }
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <InputField
                label={
                  <>
                    password<span className="text-red-500">*</span>
                  </>
                }
                type="password"
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />

              <ButtonPrimary type="submit" className="w-full mt-4">
                <span>เข้าสู่ระบบ</span>
              </ButtonPrimary>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
