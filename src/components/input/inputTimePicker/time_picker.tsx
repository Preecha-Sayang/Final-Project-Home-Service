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

export type TimePickerProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;          // step นาที (เช่น 5/10/15)
  name?: string;
  className?: string;
  placeholder?: string;
};

export default function TimePicker({
  label,
  value,
  onChange,
  step = 5,               // ดีฟอลต์ 5 นาที
  name,
  className,
  placeholder = "กรุณาเลือกเวลา",
}: TimePickerProps) {

  const dateValue = hhmmToDate(value) ?? hhmmToDate("00:00"); // ค่าเริ่มต้นเวลาในเมนู

  return (
    <label className="grid gap-2" {...(name ? { htmlFor: `tp-${name}` } : {})}>
      {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

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
        {...(name ? { "data-name": name } : {})}
      // cleanable={false}
      />
    </label>
  );
}
