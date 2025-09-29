import React from "react";

type Props = {
    label: string;
    colors?: { bg?: string | null; text?: string | null; ring?: string | null };
};

export default function Badge({ label, colors }: Props) {
    const bg = colors?.bg || "var(--gray-100)";
    const text = colors?.text || "var(--gray-700)";
    const ring = colors?.ring || "var(--gray-200)";

    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer"
            style={{ backgroundColor: bg, color: text, boxShadow: `inset 0 0 0 1px ${ring}` }}
        >
            {label}
        </span>
    );
}