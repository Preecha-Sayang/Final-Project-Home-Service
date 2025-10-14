import * as React from "react";
import { DatePicker } from "rsuite";
import { cn } from "../_style";
import 'rsuite/dist/rsuite-no-reset.min.css';

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

// ปัดนาทีให้เป็น step ที่ต้องการ (หน่วยเป็น "นาที")
function roundToStep(d: Date, stepMin: number): Date {
  const copy = new Date(d);
  const m = copy.getMinutes();
  const rounded = Math.round(m / stepMin) * stepMin;
  copy.setMinutes(rounded, 0, 0);
  return copy;
}

// ไอคอนนาฬิกา
const ClockIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
    <path d="M10 18.333A8.333 8.333 0 1 0 10 1.667a8.333 8.333 0 0 0 0 16.666Z" stroke="#9AA1B0" strokeWidth="1.4" />
    <path d="M10 5.833V10l3 1.75" stroke="#9AA1B0" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export type TimePickerSelectProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;          // step นาที (เช่น 5/10/15)
  name?: string;
  className?: string;
  placeholder?: string;
  minTime?: string;       // เวลาขั้นต่ำในรูปแบบ HH:mm
};

export default function TimePickerSelect({
  label,
  value,
  onChange,
  step = 5,               // ดีฟอลต์ 5 นาที
  name,
  className,
  placeholder = "กรุณาเลือกเวลา",
  minTime,
}: TimePickerSelectProps) {

  const dateValue = hhmmToDate(value) ?? hhmmToDate("00:00"); // ค่าเริ่มต้นเวลาในเมนู

  // ฟังก์ชันสำหรับซ่อนชั่วโมงที่น้อยกว่าเวลาขั้นต่ำ
  const hideHours = React.useCallback((hour: number) => {
    if (!minTime) return false;
    const [minHour] = minTime.split(':').map(Number);
    return hour < minHour;
  }, [minTime]);

  // ฟังก์ชันสำหรับซ่อนนาทีที่น้อยกว่าเวลาขั้นต่ำ (เฉพาะชั่วโมงเดียวกัน)
  const hideMinutes = React.useCallback((minute: number, date: Date) => {
    if (!minTime) return false;
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const selectedHour = date.getHours();
    
    // ถ้าชั่วโมงที่เลือกเท่ากับชั่วโมงขั้นต่ำ ให้ซ่อนนาทีที่น้อยกว่า
    if (selectedHour === minHour) {
      return minute < minMinute;
    }
    return false;
  }, [minTime]);

  return (
    <label className="grid gap-2 w-full" {...(name ? { htmlFor: `tp-${name}` } : {})}>
      {label && <span className="text-xs font-light text-[var(--gray-500)]">{label}</span>}

      <DatePicker
        format="HH:mm"
        value={dateValue ?? undefined}
        onChange={(d) => {
          if (!d) return onChange("");
          const rounded = roundToStep(d, Math.max(1, step));
          onChange(dateToHHMM(rounded));
        }}
        oneTap={false}
        className={cn("rsuite-timepicker", className)}
        placeholder={placeholder}
        placement="bottomEnd"
        caretAs={ClockIcon}
        editable={false}
        hideHours={hideHours}
        hideMinutes={hideMinutes}
        {...(name ? { "data-name": name } : {})}
      // cleanable={false}
      />
    </label>
  );
}

