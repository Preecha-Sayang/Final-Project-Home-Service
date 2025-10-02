// ทำเป็น style หลัก สำหรับใช้ใน input นะครับทุกคน ไม่มีไร
export type InputStatus = "default" | "success" | "error" | "disabled";

// เงาบางๆ ให้ฟีลการ์ดในรูป (ไม่ได้เวอร์)
export const base =
  "block w-full rounded-md border bg-[var(--white)] px-3 py-2 text-base text-[var(--gray-900)] shadow-[0_1px_2px_rgba(0,0,0,.03)] outline-none transition";

export const ring =
  "focus:border-[var(--blue-500)] focus:ring-2 focus:ring-[var(--blue-500)] focus:ring-offset-0";

// โทน state ให้เหมือนรูป: ขอบเทา, โฟกัสน้ำเงิน, error/disabled ชัดเจน
export const state = {
  default:
    "border-[var(--gray-300)] placeholder:text-[var(--gray-400)] hover:border-[var(--gray-400)]",
  success:
    "border-[var(--green-900)] placeholder:text-[var(--gray-400)] focus:ring-[var(--green-900)]",
  error:
    "border-[var(--red)]  focus:ring-[var(--red)]", //placeholder:text-[color-mix(in_oklab,var(--red)_40%,white)]
  disabled:
    [
      "border-[var(--gray-300)]",
      "bg-gray-100",
      "text-[var(--gray-100)]",
      "placeholder:text-[var(--gray-300)]",
      "cursor-not-allowed",
      "shadow-inner",
      "focus:ring-0 focus:border-[var(--gray-500)]",
    ].join(" "),
} as const;

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const labelCls = () =>
  "mb-1 block text-sm font-medium text-[var(--gray-800)] select-none";

export const messageCls = (isError = false) =>
  isError ? "mt-1 text-xs text-[var(--red)]" : "mt-1 text-xs text-[var(--gray-500)]";




// กันลืม
// รวม cn(), labelCls(), messageCls(), preset ต่างๆ
// util + class presets ที่ใช้ร่วมกันใน components/input
// รวม presets ที่ใช้ซ้ำ (input ทั่วไป)
// ลำดับคลาส: display → size → spacing → border → bg → text → outline/transition