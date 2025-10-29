import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/router";

interface ForgotPasswordInputs {
  email: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .matches(/^[^\s@]+@[^\s@]+\.com$/, "รูปแบบอีเมลไม่ถูกต้อง ต้องมี @ และ .com")
    .required("กรุณากรอกอีเมล"),
});

export default function ForgotPassword() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    try {
      await axios.post("/api/forgot-password", data, {
        headers: { "Content-Type": "application/json" },
      });

      await Swal.fire({
        title: "ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว!",
        text: "กรุณาตรวจสอบอีเมลของคุณภายใน 15 นาที",
        icon: "success",
        confirmButtonText: "ตกลง",
      });

      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งอีเมล";
        Swal.fire("เกิดข้อผิดพลาด", msg, "error");
      } else {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-full flex justify-center items-center mt-12">
        <div className="w-[90%] md:w-[550px] lg:w-[610px] border rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
          <span className="font-bold text-[32px] text-[var(--blue-950)] mb-6">
            ลืมรหัสผ่าน
          </span>

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputField
                  label="อีเมล"
                  placeholder="กรุณากรอกอีเมลที่ใช้สมัคร"
                  error={errors.email?.message}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onFocus={() => clearErrors("email")}
                />
              )}
            />

            <ButtonPrimary type="submit" className="w-full py-3" disabled={isSubmitting}>
              <span>ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
            </ButtonPrimary>
          </form>

          <div className="flex flex-col md:flex-row gap-1 mt-4">
            <span>จำรหัสผ่านได้แล้ว?</span>
            <ButtonGhost onClick={() => router.push("/login")}>
              <span>เข้าสู่ระบบ</span>
            </ButtonGhost>
          </div>
        </div>
      </div>
    </>
  );
}
