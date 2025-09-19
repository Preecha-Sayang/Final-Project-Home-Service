"use client";
import { useState } from "react";
import InputDropdown from "./input_dropdown";

export default function Example() {
    const [val, setVal] = useState("");
    return (
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
    );
}
