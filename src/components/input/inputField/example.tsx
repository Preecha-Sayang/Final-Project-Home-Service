import { useState } from "react";
import InputField from "@/components/input/inputField/input_state";
import { Mail } from "lucide-react";

const required = (v: string) => (v.trim() ? null : "กรุณาระบุข้อมูล");

export default function ExampleInputState() {
    const [name, setName] = useState("");
    const [tel, setTel] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPassword] = useState("");

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            {/* name */}
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <InputField
                        label="ชื่อ - นามสกุล*"
                        placeholder="กรุณากรอกชื่อ นามสกุล"
                        type="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        validate={required} //เงื่อนไขที่จะให้ error
                        maxLength={20} // จำกัดไม่เกิน 20 ตัวอักษร
                    />
                </div>
            </div>


            {/* // เบอร์โทร 10 หลัก (กำหนดความยาว + คีย์บอร์ดตัวเลข) */}
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <InputField
                        label="เบอร์โทรศัพท์*"
                        placeholder="กรุณากรอกเบอร์โทรศัพท์"
                        type="tel"
                        value={tel}
                        onChange={(e) => setTel(e.target.value)}
                        validate={required}
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                    />
                </div>
            </div>


            {/* Email */}
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <InputField
                        label="อีเมล*"
                        placeholder="ex. name@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={< Mail className="h-4 w-4" />}
                        validate={(v) => /\S+@\S+\.\S+/.test(v) ? null : "อีเมลไม่ถูกต้อง"}
                    />
                </div>
            </div >

            {/* รหัสผ่าน */}
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    < InputField
                        label="รหัสผ่าน*"
                        placeholder="กรุณากรอกรหัสผ่าน"
                        type="password"
                        value={pass}
                        onChange={(e) => setPassword(e.target.value)}
                        validate={required} //เงื่อนไขที่จะให้ error
                        maxLength={20} // จำกัดไม่เกิน 20 ตัวอักษร
                        minLength={8} // จำกัดขั้นต่ำ 8 ตัวอักษร และแสดง error เมื่อสั้นไป
                        error={pass && pass.length < 8 ? "ต้องมีอย่างน้อย 8 ตัวอักษร" : undefined}
                    />
                </div>
            </div >

            {/* Disable */}
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <InputField
                        label="Disable"
                        placeholder="••••••••"
                        status="disabled"
                    />
                </div>
            </div >
        </>

    );
}
