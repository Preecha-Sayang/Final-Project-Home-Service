// ป้ายสีหมวดหมู่
import React from "react";

export default function Badge({ label }: { label: string }) {
    const tone: Record<string, string> = {
        "บริการทั่วไป": "bg-[var(--blue-100)] text-[var(--blue-700)] ring-1 ring-[var(--blue-200)]",
        "บริการห้องครัว": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        "บริการห้องน้ำ": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
    };

    const cls = tone[label] || "bg-[var(--gray-100)] text-[var(--gray-700)] ring-1 ring-[var(--gray-200)]";
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}