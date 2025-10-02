import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "../_style";

type Props = {
    label?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    accept?: string;// default: image/*
    className?: string;
};

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export default function ImageUpload({
    label,
    value,
    onChange,
    accept = "image/*",
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const objectUrl = useMemo(() => (value ? URL.createObjectURL(value) : ""), [value]);
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);

    const pick = () => inputRef.current?.click();
    const clear = () => onChange(null);

    // Drag & Drop
    const onDragOverBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
        ev.preventDefault(); ev.stopPropagation(); setDragOver(true);
    };
    const onDragLeaveBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
        ev.preventDefault(); ev.stopPropagation(); setDragOver(false);
    };
    const onDropBox: React.DragEventHandler<HTMLDivElement> = (ev) => {
        ev.preventDefault(); ev.stopPropagation(); setDragOver(false);
        const f = ev.dataTransfer?.files?.[0];
        if (f && !rejectIfInvalid(f)) onChange(f);
    };

    function showError(msg: string) {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(""), 3000);
    }

    // ปรับตัวเช็คไฟล์
    function rejectIfInvalid(f: File) {
        const okTypes = ["image/jpeg", "image/png"];
        if (!okTypes.includes(f.type)) {
            showError("รองรับเฉพาะไฟล์ JPG หรือ PNG");
            return true;
        }
        if (f.size > MAX_SIZE) {
            showError("ไฟล์รูปต้องไม่เกิน 2 MB");
            return true;
        }
        return false;
    }

    const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (rejectIfInvalid(f)) {
            e.currentTarget.value = ""; // ให้เลือกไฟล์เดิมได้
            return;
        }
        onChange(f);
    };

    return (
        <div className={cn("grid gap-2", className)}>
            {label && (
                <span className="text-sm font-medium text-[var(--gray-800)]">
                    {typeof label === "string"
                        ? (() => {
                            const m = label.match(/^(.*?)(\s*\*)$/);
                            if (m) {
                                return (
                                    <>
                                        {m[1]}
                                        <span className="ml-1 text-[var(--red)]">*</span>
                                    </>
                                );
                            }
                            return label;
                        })()
                        : label}
                </span>
            )}

            <div
                onDragOver={onDragOverBox}
                onDragLeave={onDragLeaveBox}
                onDrop={onDropBox}
                className={cn(
                    "relative w-[433px] h-[200px] rounded-lg border-2 transition-all",
                    "bg-[var(--white)] border-dashed",
                    errorMsg ? "border-[var(--red)]" : "border-[var(--gray-300)]",
                    "hover:border-[var(--gray-400)] hover:shadow-sm",
                    dragOver && "border-[var(--blue-400)] bg-[var(--blue-50)] shadow",
                    value ? "overflow-hidden" : "cursor-pointer"
                )}
                onClick={!value ? pick : undefined}
            >

                {!value && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-6 hover:bg-[var(--gray-50)]">
                        <div className="text-sm">
                            <span className="font-medium text-[var(--blue-500)] underline hover:text-[var(--blue-700)]">
                                อัปโหลดรูปภาพ
                            </span>
                            <span className="mx-2 text-[var(--gray-600)]">หรือ ลากและวางที่นี่</span>
                        </div>
                        <div className="text-xs text-[var(--gray-400)] mt-1">PNG, JPG ขนาดไม่เกิน 2MB</div>
                    </div>
                )}

                {value && (
                    <>
                        <div className="absolute left-0 top-0 w-[300px] h-[200px] overflow-hidden">
                            <Image
                                alt="preview"
                                src={objectUrl}
                                width={300}
                                height={200}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(null);
                                    if (inputRef.current) inputRef.current.value = "";
                                }}
                                aria-label="remove-image"
                                title="ลบรูป"
                                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--gray-700)] shadow-md backdrop-blur transition hover:bg-white hover:text-[var(--red)] cursor-pointer"
                            >
                                X
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={pick}
                            className={cn(
                                "absolute right-0 top-0 h-full w-[130px] border-l-2 border-dashed",
                                "border-[var(--gray-300)] hover:border-[var(--blue-400)]",
                                "flex flex-col items-center justify-center gap-1 text-center px-2 transition hover:bg-[var(--gray-50)] active:scale-[0.99]"
                            )}
                        >
                            <span className="text-sm font-medium text-[var(--blue-600)] underline cursor-pointer">เปลี่ยนรูป</span>
                            <span className="text-[10px] text-[var(--gray-500)] leading-3">ลากมาวางได้</span>
                        </button>
                    </>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={onFileSelected}
                />
            </div>
            {/* แสดงข้อความผิดพลาดใต้กรอบ */}
            <div className="h-[15px]">
                {errorMsg && (
                    <div className="text-xs text-[var(--red)] mt-1" role="alert" aria-live="polite">
                        {errorMsg}
                    </div>
                )}
                {value && (
                    <div className="text-xs text-[var(--gray-600)] mt-1 animate-fade-in">
                        ชื่อไฟล์: <span className="font-medium">{value.name}</span>
                    </div>
                )}
            </div>

        </div>
    );
}
