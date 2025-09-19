"use client";
import { cn } from "../_style";

type Props = {
  label?: string;
  value: string;      // HH:mm
  onChange: (val: string) => void;
  step?: number;      // วินาที
  name?: string;
  className?: string;
};

export default function TimePicker({
  label, value, onChange, step = 60, name, className,
}: Props) {
  const id = name ?? `time-${label ?? "picker"}`.toLowerCase();
  return (
    <label className="grid gap-2">
      {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
      <input
        type="time"
        id={id}
        name={name}
        value={value}
        step={step}
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
