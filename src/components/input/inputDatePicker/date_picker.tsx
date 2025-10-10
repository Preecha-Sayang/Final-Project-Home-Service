import * as React from 'react';
import { DatePicker as RsDatePicker } from 'rsuite';
import { parseISO, isValid as isValidDate, format as formatDate } from 'date-fns';
import 'rsuite/dist/rsuite-no-reset.min.css';

function strToDate(v?: string): Date | null {
  if (!v) return null;
  const d = parseISO(v);
  return isValidDate(d) ? d : null;
}
function dateToStr(d?: Date | null): string {
  if (!d) return '';
  return formatDate(d, 'dd-MM-yyyy');
}

// ไอคอนปฏิทิน
const ClockIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15.8333 3.33335H15V1.66669H13.3333V3.33335H6.66667V1.66669H5V3.33335H4.16667C3.24167 3.33335 2.50833 4.08335 2.50833 5.00002L2.5 16.6667C2.5 17.5834 3.24167 18.3334 4.16667 18.3334H15.8333C16.75 18.3334 17.5 17.5834 17.5 16.6667V5.00002C17.5 4.08335 16.75 3.33335 15.8333 3.33335ZM15.8333 16.6667H4.16667V8.33335H15.8333V16.6667ZM15.8333 6.66669H4.16667V5.00002H15.8333V6.66669ZM10 10.8334H14.1667V15H10V10.8334Z" fill="var(--gray-300)" />
  </svg>
);

export type RsuiteDatePickerProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  placeholder,
  className
}: RsuiteDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // ค่าที่ “ค้างไว้ในป็อปอัป” จนกด OK
  const [draft, setDraft] = React.useState<Date | null>(() => strToDate(value));

  // sync draft เมื่อ value จากนอกเปลี่ยน
  React.useEffect(() => {
    setDraft(strToDate(value));
  }, [value]);

  const minDate = strToDate(min) || undefined;
  const maxDate = strToDate(max) || undefined;

  // ปิดเฉพาะตอนกด OK (ถ้า oneTap=false)
  const handleOk = (d: Date | null) => {
    setDraft(d);
    onChange(dateToStr(d));
    setOpen(false);
  };


  return (
    <label className={className ?? ''} style={{ display: 'grid', gap: 8 }}>
      {label && (
        <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>
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
        format="dd/MM/yyy"

        // จำกัดวัน
        shouldDisableDate={(d: Date) => {
          if (minDate && d < minDate) return true;
          if (maxDate && d > maxDate) return true;
          return false;
        }}

        // UI ปลีกย่อยให้คล้ายดีไซน์คุณ
        appearance="default"
        size="lg"
        block
        cleanable
        editable={false}  // กันพิมพ์ตรงๆ ให้เลือกจากปฏิทิน

        // ปรับข้อความ/OK/TODAY ฯลฯ จะมาจาก CustomProvider (locale ไทย)
        className="rounded-md hover:border-[var(--gray-400)] focus-within:border-[var(--blue-500)] focus-within:ring-1 focus-within:ring-[var(--blue-500)]"

        // ตัวอย่าง: ให้แสดงเดือนปัจจุบัน/เดือนจากค่าเดิม
        calendarDefaultDate={draft ?? undefined}
        placement="bottomEnd" //"bottomStart" | "bottomEnd" | "topStart" | "topEnd" |
        caretAs={ClockIcon}
      />
    </label>
  );
}
