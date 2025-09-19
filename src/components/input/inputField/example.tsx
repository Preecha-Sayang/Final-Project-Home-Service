import { useState } from "react";
import InputField from "./input_state";
import { Search, X } from "lucide-react";

export default function Example() {
    const [val, setVal] = useState("");

    return (
        <div className="grid gap-4">
            {/* เดฟอลต์ */}
            <InputField
                label="Default"
                placeholder="Place Holder"
                value={val}
                onChange={(e) => setVal(e.target.value)}
            />

            {/* success / error / disabled — เปลี่ยนเฉพาะสีให้เป็น var() แล้วใน _style.tsx */}
            <InputField label="Success" status="success" placeholder="Place Holder" />
            <InputField label="Error" status="error" error="Error Message" placeholder="Place Holder" />
            <InputField label="Disable" status="disabled" placeholder="Place Holder" />

            {/* ไอคอนซ้าย/ขวา ใช้สีเทาอ่อนจาก var() */}
            <InputField
                label="With icons"
                placeholder="ค้นหา"
                leftIcon={<Search size={16} />}
                rightIcon={<X size={16} />}
            />

            {/* asChild เดิมเป๊ะ ไม่แตะ logic */}
            <InputField label="As select" asChild>
                <select defaultValue="">
                    <option value="" disabled>เลือก…</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>
            </InputField>
        </div>
    );
}
