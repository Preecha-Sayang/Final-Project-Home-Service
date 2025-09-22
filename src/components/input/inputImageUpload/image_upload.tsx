import { useRef } from "react";
import Image from "next/image";
import { cn } from "../_style";

type Props = {
    label?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    className?: string;
};

export default function ImageUpload({
    label, value, onChange, accept = "image/*", className,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handlePick = () => inputRef.current?.click();

    return (
        <div className={cn("grid gap-2", className)}>
            {label && <span className="text-sm font-medium text-[var(--gray-800)]">{label}</span>}

            {/* กล่องเส้นปะตามภาพ */}
            <div
                onClick={handlePick}
                className="flex items-center justify-center w-full min-h-[140px] rounded-lg border-2 border-dashed border-[var(--gray-300)] bg-[var(--white)] px-4 py-6 text-center hover:border-[var(--gray-400)] transition cursor-pointer hover:bg-[var(--gray-300)"
            >
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="font-medium text-[var(--blue-500)] underline hover:text-[var(--blue-700)]">อัพโหลดรูปภาพ</span>
                        <span className="mx-2 text-[var(--gray-600)]">หรือ ลากและวางที่นี่</span>
                    </div>
                    <div className="text-xs text-[var(--gray-400)]">PNG, JPG ขนาดไม่เกิน 10MB</div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
            </div>

            {/* พรีวิวด้านล่าง (ถ้ามีไฟล์) */}
            {value && (
                <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-md border border-[var(--gray-300)]">
                    <Image fill alt="preview" src={URL.createObjectURL(value)} className="object-cover" />
                </div>
            )}
        </div>
    );
}
