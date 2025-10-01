import React, { useEffect, useRef, useState } from "react";

type Props = {
    open: boolean;
    title?: string;
    description?: React.ReactNode;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    initialValue?: string;
    loading?: boolean;
    validate?: (v: string) => string | null;
    onConfirm: (value: string) => void | Promise<void>;
    onCancel: () => void;
};

export default function InputDialog({
    open,
    title = "เพิ่มหน่วยใหม่",
    description,
    placeholder = "เช่น เครื่อง / ชิ้น / จุด",
    confirmLabel = "บันทึก",
    cancelLabel = "ยกเลิก",
    initialValue = "",
    loading = false,
    validate,
    onConfirm,
    onCancel,
}: Props) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setValue(initialValue);
            setError(null);
            // โฟกัสเมื่อเปิด
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open, initialValue]);

    if (!open) return null;

    const handleConfirm = async () => {
        const v = value.trim();
        const err = validate?.(v) ?? (v ? null : "กรุณากรอกชื่อหน่วย");
        setError(err);
        if (err) return;
        await onConfirm(v);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!loading) void handleConfirm();
        }
        if (e.key === "Escape") onCancel();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <button
                    onClick={onCancel}
                    className="float-right -mt-2 -mr-2 rounded-md p-2 text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)] cursor-pointer"
                    aria-label="close"
                >
                    ✕
                </button>

                <div className="mb-3 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center">
                        {/* ไอคอน + ในวงกลม */}
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                            <circle cx="18" cy="18" r="17" stroke="#2563EB" strokeWidth="2" />
                            <path d="M18 10v16M26 18H10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>

                <h3 className="mb-1 text-center text-lg font-semibold text-[var(--gray-900)]">{title}</h3>
                {description && (
                    <p className="mb-4 text-center text-md text-[var(--gray-600)]">{description}</p>
                )}

                <div className="mb-5">
                    <label className="mb-1 block text-sm text-[var(--gray-700)]">ชื่อหน่วย</label>
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder={placeholder}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none
              ${error ? "border-[var(--red)]" : "border-[var(--gray-300)] focus:border-[var(--blue-500)]"}
            `}
                    />
                    {error && <div className="mt-1 text-xs text-[var(--red)]">{error}</div>}
                </div>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="min-w-[120px] rounded-lg bg-[var(--blue-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? "กำลังบันทึก…" : confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="min-w-[120px] rounded-lg border border-[var(--blue-500)] px-4 py-2 text-sm font-medium text-[var(--blue-600)] hover:bg-[var(--blue-100)] disabled:opacity-60 cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}