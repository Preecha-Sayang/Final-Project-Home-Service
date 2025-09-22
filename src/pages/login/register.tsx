import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import Checkbox from "@/components/radio/check_box";
import { useState } from "react";
import { useRouter } from "next/router";

function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullname: "",
    phone_number: "",
    email: "",
    password: "",
  });
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  // ฟังก์ชันตรวจสอบ email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // ฟังก์ชันตรวจสอบรหัสผ่าน
  const isValidPassword = (password: string) => {
    const noSpecialChar = /^[A-Za-z0-9]+$/; // ไม่มีตัวอักษรพิเศษ
    return password.length >= 10 && noSpecialChar.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ตรวจสอบทุกช่องกรอกครบ
    if (!form.fullname || !form.phone_number || !form.email || !form.password) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ตรวจสอบ email
    if (!isValidEmail(form.email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }

    // ตรวจสอบ password
    if (!isValidPassword(form.password)) {
      setError(
        "รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร และไม่มีตัวอักษรพิเศษ"
      );
      return;
    }

    // ตรวจสอบ checkbox
    if (!checked) {
      setError("กรุณายอมรับข้อตกลงและเงื่อนไขก่อน");
      return;
    }

    // เรียก API signup
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert("สมัครสมาชิกสำเร็จ");
        router.push("/login/login");
      } else {
        setError(data.error || "ไม่สามารถสมัครสมาชิกได้");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen flex justify-center items-start pt-20 bg-gray-50">
        <div className="w-[610px] bg-white border border-gray-200 rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
          <span className="font-bold text-3xl text-blue-900 mb-6">
            ลงทะเบียน
          </span>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="w-[440px] flex flex-col gap-4 mb-6">
            <InputField
              label="ชื่อ - นามสกุล"
              placeholder="กรุณากรอกชื่อ นามสกุล"
              required
              value={form.fullname}
              onChange={(e) => handleChange("fullname", e.target.value)}
            />
            <InputField
              label="เบอร์โทรศัพท์"
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
              required
              value={form.phone_number}
              onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
              handleChange("phone_number", value);
              }}
            />
            <InputField
              label="อีเมล"
              type="email"
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

            <div className="flex items-center gap-2">
              <Checkbox
                id="agree"
                checked={checked}
                onChange={(val) => setChecked(val)}
              />
              <span className="text-sm text-gray-700">
                ยอมรับข้อตกลงและเงื่อนไขและนโยบายความเป็นส่วนตัว
              </span>
            </div>

            <ButtonPrimary type="submit" className="w-full mb-4 py-3">
              <span>ลงทะเบียน</span>
            </ButtonPrimary>
          </form>

          <ButtonGhost onClick={() => router.push("/login/login")}>
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </ButtonGhost>
        </div>
      </div>
    </>
  );
}

export default Register;