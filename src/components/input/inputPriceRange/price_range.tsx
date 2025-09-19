import * as Slider from "@radix-ui/react-slider";
import { cn } from "../_style";

export type Range = { min: number; max: number };

type Props = {
    label?: string;
    min: number;
    max: number;
    step?: number;                   // ปรับขั้น (ดีฟอลต์ 1)
    value: Range;                    // { min, max }
    onChange?: (val: Range) => void;  // ลากยังไม่ยิง
    onCommit?: (val: Range) => void; // ยิงตอนปล่อยมือ
    className?: string;
};

export default function PriceRangeRadix({
    label, min, max, step = 1, value, onChange, onCommit, className,
}: Props) {
    const vArr: [number, number] = [value.min, value.max];

    return (
        <div className={cn("grid gap-3", className)}>
            {/* label */}
            {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

            {/* การ์ดขาว + เงาเบาๆ ตามภาพ */}
            <div className="rounded-2xl border border-[var(--gray-100)] bg-[var(--white)] p-4 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                {/* หัวด้านบนซ้าย "0-2000฿" */}
                <div className="mb-3 text-sm text-[var(--gray-700)]">{min}-{max}฿</div>

                {/* === Radix Slider === */}
                <Slider.Root
                    min={min}
                    max={max}
                    step={step}
                    value={[value.min, value.max]}
                    onValueChange={([a, b]) => {
                        if (!onChange) return; // ถ้าไม่อยากยิงระหว่างลาก ก็ไม่เรียก
                        onChange({ min: Math.min(a, b), max: Math.max(a, b) });
                    }}
                    onValueCommit={([a, b]) => {
                        if (!onCommit) return;
                        onCommit({ min: Math.min(a, b), max: Math.max(a, b) });
                    }}
                    className="relative flex w-full select-none touch-none items-center"
                >
                    {/* Track เทาอ่อน */}
                    <Slider.Track className="relative h-2 w-full rounded-full bg-[var(--gray-300)]">
                        {/* Range ฟ้า */}
                        <Slider.Range className="absolute h-2 rounded-full bg-[var(--blue-500)]" />
                    </Slider.Track>

                    {/* Thumb ซ้าย */}
                    <Slider.Thumb
                        aria-label="Minimum"
                        className={cn(
                            // ปุ่มใหญ่ให้กดง่าย (28×28)
                            "absolute -top-2 h-3 w-3 -translate-x-1/2 rounded-full",
                            "bg-transparent outline-none",
                            "shadow-[0_1px_2px_rgba(0,0,0,.08)]",
                            // โฟกัสใส่ ring น้ำเงิน
                            "focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2 cursor-pointer"
                        )}
                    >
                        <span
                            className={cn(
                                "block h-3 w-3 rounded-full",
                                "bg-[var(--blue-500)] ring-2 ring-[var(--white)]",
                                "shadow-[0_0_0_1px_rgba(0,0,0,.08)]"
                            )}
                        />
                    </Slider.Thumb>

                    {/* Thumb ขวา — z-10 เพื่อไม่โดนชน */}
                    <Slider.Thumb
                        aria-label="Maximum"
                        className={cn(
                            "absolute -top-2 h-3 w-3 -translate-x-1/2 rounded-full",
                            "bg-transparent outline-none",
                            "shadow-[0_1px_2px_rgba(0,0,0,.08)] z-10",
                            "focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2 cursor-pointer"
                        )}
                    >
                        <span
                            className={cn(
                                "block h-3 w-3 rounded-full",
                                "bg-[var(--blue-500)] ring-2 ring-[var(--white)]",
                                "shadow-[0_0_0_1px_rgba(0,0,0,.08)]"
                            )}
                        />
                    </Slider.Thumb>
                </Slider.Root>

                {/* ตัวเลขใต้ซ้าย/ขวา */}
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--gray-500)]">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>

            {/* สรุปค่าที่เลือก */}
            <div className="text-sm text-[var(--gray-700)]">
                เลือกช่วงราคา: <b>{value.min}</b> – <b>{value.max}</b>
            </div>
        </div>
    );
}
