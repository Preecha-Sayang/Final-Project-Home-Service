import React from "react";

type Props = {
    label: string;
    bgHex?: string | null;
    textHex?: string | null;
    ringHex?: string | null;
};

export default function Badge({ label, bgHex, textHex, ringHex }: Props) {
    // สีเดิม ถ้าไม่ใช้จะมาลบออก (mock)
    const tone: Record<string, string> = {
        "บริการทั่วไป": "bg-[var(--blue-100)] text-[var(--blue-700)] ring-1 ring-[var(--blue-200)]",
        "บริการห้องครัว": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        "บริการห้องน้ำ": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    };

    if (bgHex || textHex || ringHex) {
        const style: React.CSSProperties = {
            backgroundColor: bgHex || undefined,
            color: textHex || undefined,
            borderColor: ringHex || undefined,
            borderWidth: ringHex ? 1 : undefined,
            borderStyle: ringHex ? "solid" : undefined,
        };
        return (
            <span style={style} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                {label}
            </span>
        );
    }

    const cls = tone[label] || "bg-[var(--gray-100)] text-[var(--gray-700)] ring-1 ring-[var(--gray-200)]";
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}
