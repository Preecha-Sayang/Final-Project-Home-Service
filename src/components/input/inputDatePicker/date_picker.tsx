import { cn } from "../_style";

type Props = {
  label?: string;
  value: string;              // YYYY-MM-DD
  onChange: (val: string) => void;
  min?: string;
  max?: string;
  name?: string;
  className?: string;
};

export default function DatePicker({
  label, value, onChange, min, max, name, className,
}: Props) {
  const id = name ?? `date-${label ?? "picker"}`.toLowerCase();

  return (
    <label className="grid gap-2">
      {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

      <input
        type="date"
        id={id}
        name={name}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          // ให้หน้าตาเหมือนกล่องในภาพ (โค้ง, ขอบเทา, โฟกัสน้ำเงิน)
          "block w-full rounded-md border bg-[var(--white)] px-3 py-2 text-sm outline-none transition",
          "border-[var(--gray-300)] hover:border-[var(--gray-400)]",
          "text-[var(--gray-900)] placeholder:text-[var(--gray-400)]",
          "focus:ring-2 focus:ring-[var(--blue-500)] focus:border-[var(--blue-500)]",
          className
        )}
      />
    </label>
  );
}
