import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext"; // ✅ import context

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .matches(/^[^\s@]+@[^\s@]+\.com$/, "รูปแบบอีเมลไม่ถูกต้อง ต้องมี @ และ .com")
    .required("กรุณากรอกอีเมล"),
  password: yup.string().min(12, "รหัสผ่านต้องมีอย่างน้อย 12 ตัว").required("กรุณากรอกรหัสผ่าน"),
});

export default function Login() {
  const router = useRouter();
  const { login } = useAuth(); // ✅ ดึง login จาก context

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        const { accessToken, refreshToken } = result;
        login(accessToken, refreshToken); // ✅ login ผ่าน context
        router.push("/");
      } else if (res.status === 401) {
        // แสดง error ที่ email และ password พร้อมกัน
        setError("email", {
          type: "manual",
          message: result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        });
        setError("password", {
          type: "manual",
          message: result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        });
      } else {
        alert(result.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-full flex justify-center items-center mt-12">
        <div className="w-[90%] md:w-[550px] lg:w-[610px] border rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
          <span className="font-bold text-[32px] text-[var(--blue-950)] mb-6">เข้าสู่ระบบ</span>

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputField
                  label="อีเมล"
                  placeholder="กรุณากรอกอีเมล"
                  error={errors.email?.message}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputField
                  label="รหัสผ่าน"
                  type="password"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  error={errors.password?.message}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />

            <ButtonPrimary type="submit" className="w-full py-3" disabled={isSubmitting}>
              <span>เข้าสู่ระบบ</span>
            </ButtonPrimary>
          </form>

          <div className="flex flex-col md:flex-row gap-1 mt-4 ">
            <span>ยังไม่มีบัญชีผู้ใช้ HomeService?</span>
            
            <ButtonGhost onClick={() => router.push("/register")}>
              <span>ลงทะเบียน</span>
            </ButtonGhost>
          </div>
        </div>
      </div>
    </>
  );
}