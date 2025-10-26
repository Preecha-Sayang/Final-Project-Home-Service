import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
import { useRouter } from "next/router";

interface ResetPasswordInputs {
  password: string;
  confirmPassword: string;
}

const schema = yup.object().shape({
  password: yup
    .string()
    .min(12, "รหัสผ่านต้องมีอย่างน้อย 12 ตัว")
    .required("กรุณากรอกรหัสผ่านใหม่"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "รหัสผ่านไม่ตรงกัน")
    .required("กรุณากรอกยืนยันรหัสผ่าน"),
});

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query; // token จาก URL

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordInputs) => {
    if (!token) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน", "error");
      return;
    }

    try {
      await axios.post("/api/reset-password", {
        token,
        password: data.password,
      });

      await Swal.fire({
        title: "รีเซ็ตรหัสผ่านสำเร็จ!",
        text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
        icon: "success",
        confirmButtonText: "ตกลง",
      });

      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.error || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน";
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
            ตั้งรหัสผ่านใหม่
          </span>

          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputField
                  label="รหัสผ่านใหม่"
                  type="password"
                  placeholder="กรอกรหัสผ่านใหม่"
                  error={errors.password?.message}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onFocus={() => clearErrors("password")}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <InputField
                  label="ยืนยันรหัสผ่าน"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  error={errors.confirmPassword?.message}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onFocus={() => clearErrors("confirmPassword")}
                />
              )}
            />

            <ButtonPrimary type="submit" className="w-full py-3" disabled={isSubmitting}>
              <span>ตั้งรหัสผ่านใหม่</span>
            </ButtonPrimary>
          </form>
        </div>
      </div>
    </>
  );
}
