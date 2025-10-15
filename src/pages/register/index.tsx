import Navbar from "@/components/navbar/navbar";
import InputField from "@/components/input/inputField/input_state";
import ButtonPrimary from "@/components/button/buttonprimary";
import ButtonGhost from "@/components/button/buttonghost";
import Checkbox from "@/components/radio/check_box";
import { useState } from "react";
import { useRouter } from "next/router";
import * as yup from "yup";
import { Agreement, Policy } from "@/components/agreement";
import axios from "axios";
import Swal from "sweetalert2";


// สร้าง schema validation
const schema = yup.object().shape({
  fullname: yup
    .string()
    .required("กรุณากรอกชื่อ - นามสกุล")
    .matches(
      /^[A-Za-z'-\s]+$/,
      "ชื่อ - นามสกุล ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวพิมพ์ใหญ่หรือตัวพิมพ์เล็ก และสามารถมี ' หรือ - ได้เท่านั้น"
    ),
  phone_number: yup
    .string()
    .matches(/^\d+$/, "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง")
    .required("กรุณากรอกเบอร์โทรศัพท์"),
  email: yup
    .string()
    .email("กรุณากรอกอีเมลให้ถูกต้อง")
    .required("กรุณากรอกอีเมล"),
  password: yup
    .string()
    .required("กรุณากรอกรหัสผ่าน")
    .min(12, "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร")
    .matches(/^[A-Za-z0-9]+$/, "รหัสผ่านต้องไม่มีตัวอักษรพิเศษ"),
  agree: yup.boolean().oneOf([true], "กรุณายอมรับข้อตกลงและเงื่อนไขก่อน"),
});

function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullname: "",
    phone_number: "",
    email: "",
    password: "",
  });
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAgreementModal, setShowAgreementModal] = useState(false); // สถานะของป๊อปอัพข้อตกลง
  const [showPolicyModal, setShowPolicyModal] = useState(false); // สถานะของป๊อปอัพนโยบาย

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleFocus = (field: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[field]; // ลบ error ของฟิลด์ที่ถูก focus
      return newErrors;
    });
  };

  const checkboxset = (e: boolean) => {
    setChecked(e);
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.agree; // ลบ error ของ agree เมื่อมีการเลือก
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // เคลียร์ error เก่า

    try {
      // validate form + checkbox
      await schema.validate({ ...form, agree: checked }, { abortEarly: false });
      setErrors({});

      // เรียก API signup
      await axios.post("/api/auth/signup", form, {
        headers: { "Content-Type": "application/json" },
      });

      await Swal.fire({
            title: "สมัครสมาชิกสำเร็จ!",
            text: "ยินดีต้อนรับ 😊",
            icon: "success",
            confirmButtonText: "ตกลง",
          }).then(() => {
            const redirect = router.query.redirect as string;
            if (redirect) {
              router.push(redirect);
            } else {
              router.push("/login");
            }
          });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((e) => {
          newErrors[e.path!] = e.message;
        });
        setErrors(newErrors);
      } else if (axios.isAxiosError(err)) {
        // Axios/API errors
        const errorData = err.response?.data;

        if (errorData?.error === "invalid email") {
          setErrors({ email: "อีเมลนี้ถูกใช้งานแล้ว" });
        } else if (errorData?.error === "invalid phonenumber") {
          setErrors({ phone_number: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว" });
        } else {
          setErrors({ form: errorData?.error || "ไม่สามารถสมัครสมาชิกได้" });
        }
      } else {
        setErrors({ form: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen flex justify-center items-center bg-gray-50">
        <div className="w-[90%] md:w-[550px] lg:w-[610px] bg-white border border-gray-200 rounded-lg flex flex-col justify-center items-center p-8 shadow-md">
          <span className="font-bold text-3xl text-blue-900 mb-6">
            ลงทะเบียน
          </span>

          <form
            onSubmit={handleSubmit}
            className="w-full sm:w-[440px] md:w-[400px] flex flex-col gap-4 mb-6"
            noValidate
          >
            <InputField
              label="ชื่อ - นามสกุล*"
              placeholder="กรุณากรอกชื่อ นามสกุล"
              required
              value={form.fullname}
              onChange={(e) => handleChange("fullname", e.target.value)}
              error={errors.fullname}
              onFocus={() => handleFocus("fullname")}
            />
            <InputField
              label="เบอร์โทรศัพท์*"
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
              error={errors.phone_number}
              onFocus={() => handleFocus("phone_number")}
            />
            <InputField
              label="อีเมล*"
              type="email"
              placeholder="กรุณากรอกอีเมล"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              onFocus={() => handleFocus("email")}
            />
            <InputField
              label="รหัสผ่าน*"
              type="password"
              placeholder="กรุณากรอกรหัสผ่าน"
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              onFocus={() => handleFocus("password")}
            />

            {/* Pop-up Agreement */}
            {showAgreementModal && (
              <Agreement onClose={() => setShowAgreementModal(false)} />
            )}

            {/* Pop-up Policy */}
            {showPolicyModal && (
              <Policy onClose={() => setShowPolicyModal(false)} />
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="agree"
                checked={checked}
                onChange={(val) => checkboxset(val)}
              />
              <span className="text-sm text-gray-700 inline">
                ยอมรับ{" "}
                <ButtonGhost
                  className="!text-sm inline"
                  onClick={() => setShowAgreementModal(true)}
                >
                  ข้อตกลง
                </ButtonGhost>
                และ{" "}
                <ButtonGhost
                  className="!text-sm inline"
                  onClick={() => setShowPolicyModal(true)}
                >
                  นโยบายความเป็นส่วนตัว
                </ButtonGhost>
              </span>
            </div>
            {/* แสดง error ของ agree */}
            {errors.agree && (
              <p className="text-red-500 text-sm mt-1">{errors.agree}</p>
            )}

            <ButtonPrimary type="submit" className="w-full mb-4 py-3">
              <span>ลงทะเบียน</span>
            </ButtonPrimary>
          </form>

          <ButtonGhost onClick={() => {
            const redirect = router.query.redirect as string;
            if (redirect) {
              router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
            } else {
              router.push("/login");
            }
          }}>
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </ButtonGhost>
        </div>
      </div>
    </>
  );
}

export default Register;
