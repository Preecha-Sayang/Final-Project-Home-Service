import { useState } from "react";

import InputField from "./inputField/input_state";
import InputDropdown from "./inputDropdown/input_dropdown"; // (เดิมของเต้)
import DatePicker from "./inputDatePicker/date_picker";
import TimePicker from "./inputTimePicker/time_picker";
import PriceRange, { Range } from "./inputPriceRange/price_range";
import ImageUpload from "./inputImageUpload/image_upload";
import { Search, X } from "lucide-react";

export default function TestInput() {
    const [name, setName] = useState("");
    const [val, setVal] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);

    return (
        <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Input State เหมือนรูป: default/focus/success/disable/error */}
            <InputField label="ชื่อ" placeholder="กรอกชื่อ" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField label="งบประมาณ" status="success" value="1200" readOnly />
            <InputField label="อีเมล" status="error" error="รูปแบบอีเมลไม่ถูกต้อง" />
            <InputField label="หมายเหตุ" status="disabled" placeholder="ปิดใช้งาน" />

            <InputField label="ค้นหา" placeholder="ค้นหา..." leftIcon={<Search size={16} />} rightIcon={<X size={16} />} />

            {/* Dropdown ของเต้ — ถ้าอยากให้หน้าตา “เหมือนภาพเมนูเปิด” เดี๋ยวผมช่วยผูกสี var() ในไฟล์นั้นให้ด้วยได้ */}
            <InputDropdown
                label="Dropdown"
                options={[
                    { label: "ล้างแอร์", value: "ac" },
                    { label: "ซ่อมเครื่องซักผ้า", value: "washer" },
                ]}
                value={val}
                onChange={setVal}
                placeholder="เลือกบริการ…"
            />

            <DatePicker label="วันที่" value={date} onChange={setDate} />
            <TimePicker label="เวลา" value={time} onChange={setTime} />
            <PriceRange label="ช่วงราคา" min={0} max={2000} value={budget} onChange={setBudget} />
            <ImageUpload label="รูปหน้างาน" value={photo} onChange={setPhoto} />
        </div>
    );
}
