import { useState } from "react";
import InputDropdown, { Option } from "@/components/input/inputDropdown/input_dropdown";

const options: Option[] = [
    { label: "บริการทั้งหมด", value: "all" },
    { label: "บริการทั่วไป", value: "general" },
    { label: "บริการห้องครัว", value: "kitchen" },
    { label: "บริการห้องน้ำ", value: "restroom" },
];

export default function ExampleInputDropdown() {
    const [service, setService] = useState("");

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <InputDropdown
                        label="Dropdown"
                        options={options}
                        value={service}
                        onChange={setService}
                        placeholder="เลือกบริการ…"
                    // disabled
                    />
                </div>
            </div>
        </>

    );
}
