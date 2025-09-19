"use client";
import { cn } from "../_style";

export type Option = { label: string; value: string };

type Props = {
    label?: string;
    options: Option[];
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    className?: string;
};

export default function InputDropdown({
    label, options, value, onChange,
    placeholder = "Select…", name, disabled, className,
}: Props) {
    const id = name ?? `select-${label ?? "field"}`.toLowerCase();

    return (
        <label className="grid gap-2">
            {/* label: เทาเข้มจากพาเล็ต */}
            {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

            <select
                id={id}
                name={name}
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    // โครงหลัก: ขอบเทาอ่อน พื้นขาว ตัวอักษรเทาเข้ม
                    "block w-full rounded-md border bg-[var(--white)] px-3 py-2 text-sm outline-none transition",
                    "border-[var(--gray-300)] text-[var(--gray-900)] placeholder:text-[var(--gray-400)]",
                    // โฟกัสน้ำเงินตามธีม
                    "focus:ring-2 focus:ring-[var(--blue-500)] focus:border-[var(--blue-500)]",
                    // hover ขอบเข้มขึ้นนิด
                    "hover:border-[var(--gray-400)]",
                    // disabled: โทนเทาและปิดเมาส์
                    disabled && "bg-[var(--gray-100)] text-[var(--gray-400)] cursor-not-allowed border-[var(--gray-200)]",
                    // ทิ้งช่องให้ปรับเพิ่มภายนอก
                    className
                )}
            >
                {/* option แรกใช้เป็น placeholder (สีจัดใน select เองพอ) */}
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </label>
    );
}
