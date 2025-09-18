"use client";
import { cn } from "./utils";

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
    label,
    options,
    value,
    onChange,
    placeholder = "Select…",
    name,
    disabled,
    className,
}: Props) {
    const id = name ?? `select-${label ?? "field"}`.toLowerCase();
    return (
        <label className="grid gap-2">
            {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
            <select
                id={id}
                name={name}
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition",
                    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "hover:border-gray-400",
                    disabled && "bg-gray-100 text-gray-400 cursor-not-allowed",
                    className
                )}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}