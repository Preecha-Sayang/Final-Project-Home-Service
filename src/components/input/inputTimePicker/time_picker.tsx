import * as React from "react";
import { DatePicker, type DatePickerProps } from "rsuite";
import { cn } from "../_style";
import 'rsuite/dist/rsuite-no-reset.min.css';

// ----- utils -----
function hhmmToDate(value?: string): Date | null {
  if (!value) return null;
  const [hh, mm] = value.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}
function dateToHHMM(d?: Date | null) {
  if (!d) return "";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// ไอคอนนาฬิกา (แทน caret เดิมของ rsuite)
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 18.333A8.333 8.333 0 1 0 10 1.667a8.333 8.333 0 0 0 0 16.666Z" stroke="#9AA1B0" strokeWidth="1.4" />
    <path d="M10 5.833V10l3 1.75" stroke="#9AA1B0" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export type TimePickerProps = {
  label?: string;
  value: string;                // "HH:mm"
  onChange: (v: string) => void;
  step?: number;                // หน่วยเป็น "วินาที" (ดีฟอลต์ 60 = ทีละ 1 นาที)
  name?: string;
  className?: string;
  placeholder?: string;
};

export default function TimePicker({
  label,
  value,
  onChange,
  step = 60,
  name,
  className,
  placeholder = "กรุณาเลือกเวลา",
}: TimePickerProps) {

  const dateValue = hhmmToDate(value) ?? hhmmToDate("00:00"); // ค่าเริ่มต้นเวลาในเมนู

  return (
    <label className="grid gap-2">
      {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

      <DatePicker
        // โหมดเวลาอย่างเดียว
        format="HH:mm"
        value={dateValue ?? undefined}
        onChange={(d) => onChange(dateToHHMM(d))}
        // กดเลือกแล้ว *ไม่* ปิดทันที ให้กดปุ่ม OK
        oneTap={false}
        // เพิ่มเส้นทาง focus + border เหมือน input ในระบบ
        className={cn("rsuite-timepicker", className)}
        placeholder={placeholder}
        placement="bottomEnd"
        // ปรับให้ caret เป็นไอคอนนาฬิกา
        caretAs={ClockIcon as any}
        // ล็อกให้คลิกเลือกเท่านั้น (ไม่ต้องพิมพ์เอง)
        editable={false}
        // กำหนด step ของนาทีจากวินาที (rsuite เป็นหน่วย "นาที")
        // เช่น step=60 (วินาที) => minuteStep = 1
        //     step=300 => 5 นาที
        //     step=900 => 15 นาที
        // @ts-expect-error rsuite type ยังไม่เปิด minuteStep ในบางเวอร์ชัน
        minuteStep={Math.max(1, Math.round(step / 60))}
        // ทำให้มีปุ่ม OK/Cancel
        okButtonText="ยืนยัน"
        cleanButtonText="ยกเลิก"
      // ป้องกันล้างค่าโดยบังเอิญ (อยากให้มีปุ่มล้างเอาออกคอมเมนต์บรรทัดล่าง)
      // cleanable={false}
      />
    </label>
  );
}
