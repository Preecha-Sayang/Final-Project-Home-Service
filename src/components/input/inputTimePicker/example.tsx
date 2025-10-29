import { useState } from "react";
import TimePicker from "@/components/input/inputTimePicker/time_picker";

export default function ExampleTimePicker() {
    const [time, setTime] = useState("00:00");

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <TimePicker
                        label="Time Picker"
                        value={time}
                        onChange={setTime}
                        step={60}// เลือกครั้งละ 1 นาที (300 = ครั้งละ 5 นาที)
                    />
                </div>
            </div>
        </>
    );
}
