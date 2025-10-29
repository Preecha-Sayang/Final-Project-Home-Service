import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
// import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../../../public/images/logo.png";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

interface LoginAdminType {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .matches(
      /^[^\s@]+@[^\s@]+\.com$/,
      "รูปแบบอีเมลไม่ถูกต้อง ต้องมี @ และ .com"
    )
    .required("กรุณากรอกอีเมล"),
  password: yup.string().required("กรุณากรอกรหัสผ่าน"),
});

export default function AdminLogin() {
  const router = useRouter();
  // const [form, setForm] = useState({ email: "", password: "" });
  //const [error, setError] = useState("");
  // const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginAdminType>({
    resolver: yupResolver(schema),
  });

  // const handleChange = (name: string, value: string) => {
  //   setForm({ ...form, [name]: value });
  // };

  const onSubmit = async (data: LoginAdminType) => {
    //setError("");
    // setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result);
      if (res.ok) {
        // เก็บ JWT ใน localStorage
        //localStorage.setItem("token", result.token);

        // Redirect ตาม role
        if (result.admin.role === "admin") {
          router.push("/admin/categories");
        } else if (result.admin.role === "technician") {
          router.push("/technician");
        } else {
          alert("ไม่พบ role ที่รองรับ");
        }
      } else if (res.status === 401) {
        // แสดง error ที่ email และ password พร้อมกัน
        setError("email", {
          type: "manual",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        });
        setError("password", {
          type: "manual",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
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
      <div className="w-full h-full flex flex-wrap justify-center items-center mt-28">
        <Image
          src={logo}
          alt="HomeServices"
          className=""
          width={447.67}
          height={79}
          priority
          sizes="447.67px"
        />
        <div className="w-full h-full flex justify-center items-center mt-10">
          <div className="w-[550px] h-[450px] border rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
            <p className="font-bold text-[32px] text-[var(--blue-950)] mb-6">
              เข้าสู่ระบบแอดมิน
            </p>

            {/* {error && <p className="text-red-500 mb-4">{error}</p>} */}

            <form
              className="w-[440px] max-w-full flex flex-col space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* <InputField
                label="Email*"
                type="email"
                error={errors.email?.message}
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              /> */}
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="Email*"
                    placeholder="กรุณากรอกอีเมล"
                    error={errors.email?.message}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {/* <InputField
                label="password*"
                type="password"
                error={errors.password?.message}
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
              /> */}

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <InputField
                    label="password*"
                    type="password"
                    placeholder="กรุณากรอกรหัสผ่าน"
                    error={errors.password?.message}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />

              <ButtonPrimary
                type="submit"
                className="w-full mt-4"
                disabled={isSubmitting}
              >
                <span>เข้าสู่ระบบ</span>
              </ButtonPrimary>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
