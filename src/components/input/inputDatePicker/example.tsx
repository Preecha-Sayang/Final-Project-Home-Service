"use client";
import { useState } from "react";
import DatePicker from "./date_picker";

export default function Example() {
    const [d, setD] = useState("");
    return <DatePicker label="Date Picker" value={d} onChange={setD} />;
}
