"use client";
import { useState } from "react";
import TimePicker from "./time_picker";

export default function Example() {
    const [t, setT] = useState("10:00");
    return <TimePicker label="Time Picker" value={t} onChange={setT} />;
}
