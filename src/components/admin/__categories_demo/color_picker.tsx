import React from "react";

type Props = {
    label: string;
    value: string;
    onChange: (hex: string) => void;
    required?: boolean;
};

function normalize(hex: string): string {
    let h = hex.trim();
    if (!h.startsWith("#")) h = `#${h}`;
    if (h.length === 4) { // e.g. #abc -> #aabbcc
        h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
    }
    return h.slice(0, 7).toUpperCase();
}

export default function ColorPicker({ label, value, onChange, required = false }: Props) {
    return (
        <div className="grid gap-2">
            <div className="text-sm text-[var(--gray-700)]">
                {label} {required && <span className="text-[var(--red)]">*</span>}
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value || "#FFFFFF"}
                    onChange={(e) => onChange(normalize(e.target.value))}
                    className="h-10 w-10 cursor-pointer rounded border border-[var(--gray-300)] bg-transparent p-0"
                    aria-label={label}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(normalize(e.target.value))}
                    placeholder="#FFFFFF"
                    maxLength={7}
                    className="h-[40px] w-[140px] rounded border border-[var(--gray-300)] px-3"
                />
                <div
                    className="h-10 w-20 rounded border"
                    style={{ backgroundColor: value }}
                    aria-hidden
                />
            </div>
        </div>
    );
}
