"use client";
import { useState } from "react";
import InputField from "@/components/input/input_state";
import InputDropdown from "@/components/input/input_dropdown";
import DatePicker from "@/components/input/date_picker";
import TimePicker from "@/components/input/time_picker";
import PriceRange, { Range } from "@/components/input/price_range";
import ImageUpload from "@/components/input/image_upload";

import { Search, X } from "lucide-react";

function ExampleInputTemplate() {
    const [name, setName] = useState("");
    const [service, setService] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);

    const handleSubmit = () => {
        // ส่งข้อมูลขึ้น API / บันทึก state
        // ตัวอย่าง payload:
        // { name, service, date, time, budget, hasPhoto: !!photo }
    };

    return (
        <div className="grid gap-6 p-6 md:grid-cols-2">

            {/* InputField แบบ1 */}
            <InputField
                label="ชื่อ"
                placeholder="กรอกชื่อ"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            {/* InputField แบบ2 */}
            <InputField label="งบประมาณ" status="success" value="1200" readOnly />
            <InputField label="อีเมล" status="error" error="รูปแบบอีเมลไม่ถูกต้อง" />
            <InputField label="หมายเหตุ" status="disabled" placeholder="ปิดใช้งาน" />

            {/* InputField แบบ3 */}
            <InputField
                label="ค้นหา"
                placeholder="ค้นหา..."
                leftIcon={<Search size={16} />}
                rightIcon={<X size={16} />}
            />

            {/* InputField แบบ4 <select>*/}
            <InputField label="บริการ" asChild>
                <select defaultValue="">
                    <option value="" disabled>เลือกบริการ…</option>
                    <option value="ac">ล้างแอร์</option>
                    <option value="washer">ซ่อมเครื่องซักผ้า</option>
                </select>
            </InputField>

            {/* InputField แบบ4 <textarea>*/}
            <InputField label="รายละเอียดงาน" asChild hint="บรรยายอาการโดยย่อ">
                <textarea rows={4} placeholder="เช่น น้ำหยด เสียงดังผิดปกติ..." />
            </InputField>

            {/* ----------------------------------------------------- */}

            <InputDropdown
                label="บริการ"
                options={[
                    { label: "ล้างแอร์", value: "ac" },
                    { label: "ซ่อมเครื่องซักผ้า", value: "washer" },
                ]}
                value={service}
                onChange={setService}
                placeholder="เลือกบริการ…"
            />

            {/* ----------------------------------------------------- */}

            <DatePicker label="วันที่" value={date} onChange={setDate} />

            {/* ----------------------------------------------------- */}

            <TimePicker label="เวลา" value={time} onChange={setTime} />

            {/* ----------------------------------------------------- */}

            <PriceRange label="ช่วงราคา" min={0} max={2000} value={budget} onChange={setBudget} />

            {/* ----------------------------------------------------- */}

            <ImageUpload label="รูปหน้างาน" value={photo} onChange={setPhoto} />

            {/* ----------------------------------------------------- */}

            <div className="md:col-span-2">
                <button
                    onClick={handleSubmit}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    ส่งคำขอ
                </button>
            </div>
        </div>
    );
}

export default ExampleInputTemplate;
