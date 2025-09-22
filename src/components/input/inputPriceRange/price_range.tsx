import * as Slider from "@radix-ui/react-slider";
import { cn } from "../_style";
import * as React from "react";

export type Range = { min: number; max: number };

type Props = {
    label?: string;
    min: number;
    max: number;
    step?: number;
    value: Range;
    onChange?: (val: Range) => void;
    onCommit?: (val: Range) => void;
    className?: string;
};

export default function PriceRange({
    label, min, max, step = 1, value, onChange, onCommit, className,
}: Props) {
    return (
        <div className={cn("grid gap-3", className)}>
            {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

            <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--white)] p-4 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <div className="mb-3 text-sm text-[var(--gray-700)]">{min}-{max}฿</div>

                {/* กล่องครอบเพื่ออิงตำแหน่ง badge */}
                <div className="relative px-2 py-3">
                    <Slider.Root
                        min={min}
                        max={max}
                        step={step}
                        value={[value.min, value.max]}
                        onValueChange={([a, b]) => onChange?.({ min: Math.min(a, b), max: Math.max(a, b) })}
                        onValueCommit={([a, b]) => onCommit?.({ min: Math.min(a, b), max: Math.max(a, b) })}
                        className="relative mx-2 flex w-[calc(100%-1rem)] select-none touch-none items-center"
                    >
                        <Slider.Track className="relative h-2 w-full rounded-full bg-[var(--gray-300)]">
                            <Slider.Range className="absolute h-2 rounded-full bg-[var(--blue-500)]" />
                        </Slider.Track>

                        {/* Thumb ซ้าย + ป้าย */}
                        <Slider.Thumb
                            aria-label="Minimum"
                            className={cn(
                                "relative -top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-transparent outline-none cursor-pointer"
                            )}
                        >
                            {/* หัวกลม */}
                            <span className="block h-3 w-3 rounded-full bg-[var(--blue-500)] ring-2 ring-[var(--white)] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" />

                            {/* ป้ายใต้หัว — เกาะกับตำแหน่งหัวแน่นอน */}
                            <span
                                className="pointer-events-none absolute left-1/2 top-[18px] -translate-x-1/2 rounded-md
                 bg-[var(--white)] px-2 py-0.5 text-xs text-[var(--gray-800)] shadow-sm ring-1 ring-[var(--gray-200)]"
                            >
                                {value.min}
                            </span>
                        </Slider.Thumb>

                        {/* Thumb ขวา + ป้าย */}
                        <Slider.Thumb
                            aria-label="Maximum"
                            className={cn(
                                "relative -top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-transparent outline-none cursor-pointer z-10"
                            )}
                        >
                            <span className="block h-3 w-3 rounded-full bg-[var(--blue-500)] ring-2 ring-[var(--white)] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" />
                            <span
                                className="pointer-events-none absolute left-1/2 top-[18px] -translate-x-1/2 rounded-md
                 bg-[var(--white)] px-2 py-0.5 text-xs text-[var(--gray-800)] shadow-sm ring-1 ring-[var(--gray-200)]"
                            >
                                {value.max}
                            </span>
                        </Slider.Thumb>
                    </Slider.Root>

                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-[var(--gray-500)]">
                    {/* <span>{min}</span> */}
                    {/* <span>{max}</span> */}
                </div>
            </div>

            {/* สรุปค่า */}
            <div className="text-sm text-[var(--gray-700)]">
                เลือกช่วงราคา: <b>{value.min}</b> – <b>{value.max}</b>
            </div>
        </div>
    );
}
