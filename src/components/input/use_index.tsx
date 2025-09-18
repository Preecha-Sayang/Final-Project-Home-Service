"use client";
import { useState } from "react";
import InputField from "@/components/input/input_state";
import InputDropdown from "@/components/input/input_dropdown";
import DatePicker from "@/components/input/date_picker";
// import TimePicker from "@/components/input/time_picker";
// import PriceRange from "@/components/input/price_range";
import ImageUpload from "@/components/input/image_upload";

export default function BookingForm() {
    const [name, setName] = useState("");
    const [service, setService] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);

    return (
        <div className="grid gap-6 p-6 md:grid-cols-2">
            <InputField label="ชื่อ" placeholder="สมชาย" value={name} onChange={e => setName(e.target.value)} />

            <InputDropdown
                label="บริการ"
                placeholder="เลือกบริการ…"
                options={[
                    { label: "ล้างแอร์", value: "ac" },
                    { label: "ซ่อมเครื่องซักผ้า", value: "washer" },
                    { label: "ติดตั้งเครื่องทำน้ำอุ่น", value: "heater" },
                ]}
                value={service}
                onChange={setService}
            />

            <DatePicker label="วันที่" value={date} onChange={setDate} />
            {/* <TimePicker label="เวลา" value={time} onChange={setTime} />

            <PriceRange label="ช่วงราคา" min={0} max={2000} value={budget} onChange={setBudget} /> */}
            <ImageUpload label="รูปหน้างาน" value={photo} onChange={setPhoto} />
        </div>
    );
}
