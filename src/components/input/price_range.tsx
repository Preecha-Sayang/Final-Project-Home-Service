"use client";
import { cn } from "./utils";

export type Range = { min: number; max: number };

type Props = {
    label?: string;
    min: number;
    max: number;
    step?: number;
    value: Range;
    onChange: (val: Range) => void; //เก็บค่าตอนลาก
    className?: string; //กำหนดเพิ่มเอาไว้แต่งสวย
};

export default function PriceRange({
    label,
    min,
    max,
    step = 50,
    value,
    onChange,
    className,
}: Props) {
    const clamp = (n: number) => Math.min(max, Math.max(min, n));
    const handleMin = (n: number) =>
        onChange({ min: clamp(Math.min(n, value.max)), max: value.max });
    const handleMax = (n: number) =>
        onChange({ min: value.min, max: clamp(Math.max(n, value.min)) }); //ส่งค่า และตั้งเริ่มต้น 0-2,000

    return (
        <div className={cn("grid gap-3", className)}>
            {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
            <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                    <span className="text-xs text-gray-600">ขั้นต่ำ</span>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value.min}
                        onChange={(e) => handleMin(Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="grid gap-1">
                    <span className="text-xs text-gray-600">ขั้นสูง</span>
                    <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={value.max}
                        onChange={(e) => handleMax(Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* แถบ range ควบคุมด้วยสอง input */}
            <div className="relative mt-1">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value.min}
                    onChange={(e) => handleMin(Number(e.target.value))}
                    className="range range-primary absolute inset-0 pointer-events-auto opacity-60"
                    style={{ width: "100%" }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value.max}
                    onChange={(e) => handleMax(Number(e.target.value))}
                    className="range range-primary w-full"
                />
            </div>

            <div className="text-sm text-gray-700">
                เลือกช่วงราคา: <b>{value.min}</b> – <b>{value.max}</b>
            </div>
        </div>
    );
}
