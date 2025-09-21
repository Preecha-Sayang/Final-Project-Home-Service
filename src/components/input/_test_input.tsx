import { useState } from "react";

import InputDropdown from "./inputDropdown/input_dropdown"; // (เดิมของเต้)
import DatePicker from "./inputDatePicker/date_picker";
import TimePicker from "./inputTimePicker/time_picker";
import PriceRange, { Range } from "./inputPriceRange/price_range";
import ImageUpload from "./inputImageUpload/image_upload";
import ExampleInputState from "./inputField/example";

export default function TestInput() {
    const [val, setVal] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);

    

    return (
        <div className="flex flex-col justify-center items-center max-w-[1200px] gap-6 p-6">
            {/* * Ctrl + (คลิกที่ Example ที่ต้องการ เพื่อดูโค้ดและนำไปใช้งาน) */}
            <ExampleInputState />













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
