import { useState } from "react";

import PriceRange, { Range } from "./inputPriceRange/price_range";
import ImageUpload from "./inputImageUpload/image_upload";
import ExampleInputState from "./inputField/example";
import ExampleInputDropdown from "./inputDropdown/example";
import ExampleDatePicker from "./inputDatePicker/example";
import ExampleTimePicker from "./inputTimePicker/example";

export default function TestInput() {
    const [time, setTime] = useState("10:00");
    const [budget, setBudget] = useState<Range>({ min: 0, max: 2000 });
    const [photo, setPhoto] = useState<File | null>(null);



    return (
        <div className="flex flex-col justify-center items-center max-w-[1200px] gap-6 p-6">
            {/* * Ctrl + (คลิกที่ Example ที่ต้องการ เพื่อดูโค้ดและนำไปใช้งาน) */}
            <ExampleInputState />
            <ExampleInputDropdown />
            <ExampleDatePicker />
            <ExampleTimePicker />

            <PriceRange label="ช่วงราคา" min={0} max={2000} value={budget} onChange={setBudget} />
            <ImageUpload label="รูปหน้างาน" value={photo} onChange={setPhoto} />
        </div>
    )
}
