"use client";
import { cn } from "./utils";

type Props = {
  label?: string;
  value: string;              // รูปแบบ YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  name?: string;
  className?: string;
};

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  name,
  className,
}: Props) {
  const id = name ?? `date-${label ?? "picker"}`.toLowerCase();

  return (
    <label className="grid gap-2">
      {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "hover:border-gray-400",
          className
        )}
      />
    </label>
  );
}
