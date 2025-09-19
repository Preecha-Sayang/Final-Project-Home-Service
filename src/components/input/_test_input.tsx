// หน้าเดโมรวม (เอาไว้เทสเฉยๆนะ)

import { useState } from "react";

import InputField from "./inputField/input_state";
import InputDropdown from "./inputDropdown/input_dropdown";
import DatePicker from "./inputDatePicker/date_picker";
import TimePicker from "./inputTimePicker/time_picker";
import PriceRange, { Range } from "./inputPriceRange/price_range";
import ImageUpload from "./inputImageUpload/image_upload";
import { Search, X } from "lucide-react";

export default function TestInput() {
    const [name, setName] = useState("");
    const [service, setService] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);

    return (
        <div className="grid gap-6 p-6 md:grid-cols-2">
            <InputField label="ชื่อ" placeholder="กรอกชื่อ" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField label="งบประมาณ" status="success" value="1200" readOnly />
            <InputField label="อีเมล" status="error" error="รูปแบบอีเมลไม่ถูกต้อง" />
            <InputField label="หมายเหตุ" status="disabled" placeholder="ปิดใช้งาน" />
            <InputField label="ค้นหา" placeholder="ค้นหา..." leftIcon={<Search size={16} />} rightIcon={<X size={16} />} />

            <InputDropdown
                label="บริการ"
                options={[{ label: "ล้างแอร์", value: "ac" }, { label: "ซ่อมเครื่องซักผ้า", value: "washer" }]}
                value={service}
                onChange={setService}
                placeholder="เลือกบริการ…"
            />

            <DatePicker label="วันที่" value={date} onChange={setDate} />
            <TimePicker label="เวลา" value={time} onChange={setTime} />
            <PriceRange label="ช่วงราคา" min={0} max={2000} value={budget} onChange={setBudget} />
            <ImageUpload label="รูปหน้างาน" value={photo} onChange={setPhoto} />
        </div>
    );
}
