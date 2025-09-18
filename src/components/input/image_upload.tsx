"use client";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "./utils";

type Props = {
    label?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    accept?: string; // ตัวอย่าง "image/*"
    className?: string;
};

export default function ImageUpload({
    label,
    value,
    onChange,
    accept = "image/*",
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handlePick = () => inputRef.current?.click();

    return (
        <div className={cn("grid gap-2", className)}>
            {label && <span className="text-sm font-medium text-gray-800">{label}</span>}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handlePick}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                >
                    เลือกรูป
                </button>
                {value && <span className="text-sm text-gray-700">{value.name}</span>}
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="text-sm text-red-600 hover:underline"
                    >
                        ลบรูป
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />

            {value && (
                <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-md border">
                    {/* แสดง preview แบบ blob */}
                    <Image
                        fill
                        alt="preview"
                        src={URL.createObjectURL(value)}
                        className="object-cover"
                    />
                </div>
            )}
        </div>
    );
}
