import { useState } from "react";
import DatePicker from "@/components/input/inputDatePicker/date_picker";
import CodeButton from "../code/codeButton";
import { format } from "date-fns";

const minToday = format(new Date(), "yyyy-MM-dd");

export default function ExampleDatePicker() {
    const [date, setDate] = useState(''); // "YYYY-MM-DD"

    const codeDate = `
import DatePicker from "@/components/input/inputDatePicker/date_picker";
import { format } from "date-fns";

const [date, setDate] = useState('');
const minToday = format(new Date(), "yyyy-MM-dd");

<div className="w-[360px]">
    <DatePicker
        label="วันที่นัดหมาย"
        value={date}
        onChange={setDate}
        min={minToday} //"2025-09-01" //เอาไว้กำหนด ขอบเขตเริ่มต้น
        max="2025-12-31" //เอาไว้กำหนด ขอบเขตสิ้นสุด
    />
</div>
`;

    return (
        <>
            <div className="w-[1200px] font-medium text-[var(--gray-700)]"></div>
            <div className="flex justify-center items-center">
                <div className="w-[360px]">
                    <DatePicker
                        label="วันที่นัดหมาย"
                        value={date}
                        onChange={setDate}
                        min={minToday} //"2025-09-01" //เอาไว้กำหนด ขอบเขตเริ่มต้น
                        max="2025-12-31" //เอาไว้กำหนด ขอบเขตสิ้นสุด
                    />
                </div>
                <div>
                    <CodeButton title="Input State" code={codeDate} />
                </div>
            </div>
        </>

    )

}
