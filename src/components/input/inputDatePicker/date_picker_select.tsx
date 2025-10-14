import * as React from 'react';
import { DatePicker as RsDatePicker } from 'rsuite';
import { parse, isValid as isValidDate, format as formatDate, startOfDay } from 'date-fns';
import 'rsuite/dist/rsuite-no-reset.min.css';

function strToDate(v?: string): Date | null {
  if (!v) return null;
  // รองรับทั้ง dd-MM-yyyy และ ISO format
  let d: Date;
  
  // ลองแปลง dd-MM-yyyy ก่อน
  if (v.includes('-') && v.split('-')[0].length <= 2) {
    d = parse(v, 'dd-MM-yyyy', new Date());
  } else {
    // ถ้าไม่ใช่ ลอง parse ปกติ
    d = new Date(v);
  }
  
  return isValidDate(d) ? d : null;
}
function dateToStr(d?: Date | null): string {
  if (!d) return '';
  return formatDate(d, 'dd-MM-yyyy');
}

export type DatePickerSelectProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

export default function DatePickerSelect({
  label,
  value,
  onChange,
  min,
  max,
  placeholder = 'กรุณาเลือกวันที่',
  className
}: DatePickerSelectProps) {
  const [open, setOpen] = React.useState(false);

  // ค่าที่ "ค้างไว้ในป็อปอัป" จนกด OK
  const [draft, setDraft] = React.useState<Date | null>(() => strToDate(value));

  // sync draft เมื่อ value จากนอกเปลี่ยน
  React.useEffect(() => {
    setDraft(strToDate(value));
  }, [value]);

  const minDate = React.useMemo(() => {
    const date = strToDate(min);
    return date ? startOfDay(date) : undefined;
  }, [min]);
  
  const maxDate = React.useMemo(() => {
    const date = strToDate(max);
    return date ? startOfDay(date) : undefined;
  }, [max]);

  // ปิดเฉพาะตอนกด OK (ถ้า oneTap=false)
  const handleOk = (d: Date | null) => {
    // ตรวจสอบว่าวันที่ที่เลือกไม่ได้อยู่ในอดีต
    if (d && minDate) {
      const selectedDay = startOfDay(d);
      if (selectedDay < minDate) {
        // ไม่อนุญาตให้เลือกวันที่ผ่านมาแล้ว
        return;
      }
    }
    
    setDraft(d);
    onChange(dateToStr(d));
    setOpen(false);
  };


  return (
    <label className={`w-full ${className ?? ''}`} style={{ display: 'grid', gap: 8 }}>
      {label && (
        <span className="text-xs font-light text-[var(--gray-500)]">{label}</span>
      )}

      <RsDatePicker
        // แสดง/ซ่อนป็อปอัป เราคุมเองด้วย state `open`
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}

        // ค่าในอินพุต (คอมมิตแล้ว) ต้องเป็น Date
        value={strToDate(value) ?? undefined}

        // ค่าในปฏิทินเวลาคลิกวัน

        onOk={handleOk}

        // ไม่ให้มันคอมมิตตอนเลือกวัน (เราจะคอมมิตที่ OK เอง)
        onChange={() => { /* no-op: ป้องกันคอมมิตอัตโนมัติ */ }}

        // ปุ่มทริกเกอร์ — ใช้คลิกเปิด/ปิด
        // โดยดีฟอลต์ RSuite ทำให้คลิกแล้วเปิด/ปิดได้อยู่แล้ว
        placeholder={placeholder}
        format="dd-MM-yyy"

        // จำกัดวัน - เปรียบเทียบแบบ startOfDay เพื่อไม่นับเวลา
        shouldDisableDate={(d: Date) => {
          const dateOnly = startOfDay(d);
          if (minDate && dateOnly < minDate) {
            return true;
          }
          if (maxDate && dateOnly > maxDate) {
            return true;
          }
          return false;
        }}

        // UI ปลีกย่อยให้คล้ายดีไซน์คุณ
        appearance="default"
        size="md"
        block
        cleanable
        editable={false}  // กันพิมพ์ตรงๆ ให้เลือกจากปฏิทิน

        // ปรับข้อความ/OK/TODAY ฯลฯ จะมาจาก CustomProvider (locale ไทย)
        className="rounded-md border border-[var(--gray-300)] hover:border-[var(--gray-400)] focus-within:border-[var(--blue-500)] focus-within:ring-1 focus-within:ring-[var(--blue-500)]"

        // ตัวอย่าง: ให้แสดงเดือนปัจจุบัน/เดือนจากค่าเดิม
        calendarDefaultDate={draft ?? undefined}
        placement="bottomEnd" //"bottomStart" | "bottomEnd" | "topStart" | "topEnd" |
      />
    </label>
  );
}

