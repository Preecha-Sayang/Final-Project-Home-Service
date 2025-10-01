import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "../_style";

type Props = {
    label?: string;
    value: File | null;
    onChange: (file: File | null) => void;
    standaloneUpload?: boolean; //=false / true(เปิดปุ่ม)
    onUploaded?: (url: string) => void;
    /** /api/upload || /api/upload-url */
    serviceId?: number;
    accept?: string;
    className?: string;
};

export default function ImageUpload({
    label,
    value,
    onChange,
    standaloneUpload = false,
    onUploaded,
    serviceId,
    accept = "image/*",
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState("");

    const handlePick = () => inputRef.current?.click();

    const handleUpload = async () => {
        if (!value) return;
        try {
            setIsUploading(true);
            const fd = new FormData();
            fd.append("file", value);

            // โหมดเดิม: ถ้ามี serviceId > ยิง /api/upload (อัปเดต services.image_url)
            // ถ้าไม่มี > ยิง /api/upload-url เอาแต่ลิงก์กลับมา
            const endpoint = serviceId ? "/api/upload" : "/api/upload-url";
            if (serviceId) fd.append("serviceId", String(serviceId));

            const res = await fetch(endpoint, { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok || !data?.ok) throw new Error(data?.message || "Upload failed.");

            const url: string = data.cloudinary?.url;
            setUploadedUrl(url);
            onUploaded?.(url);
        } catch (e) {
            alert((e as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={cn("grid gap-2", className)}>
            {label && (
                <span className="text-sm font-medium text-[var(--gray-800)]">
                    {typeof label === "string"
                        ? (() => {
                            // ถ้าลงท้ายด้วย * ให้แสดงเป็นสีแดง
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

            {/* กล่องอัปโหลด (ธีมเดิม) */}
            <div
                onClick={handlePick}
                className="flex items-center justify-center w-[433px] min-h-[140px] rounded-lg border-2 border-dashed border-[var(--gray-300)] bg-[var(--white)] px-4 py-6 text-center hover:border-[var(--gray-400)] transition cursor-pointer hover:bg-[var(--gray-300)]"
            >
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="font-medium text-[var(--blue-500)] underline hover:text-[var(--blue-700)]">อัปโหลดรูปภาพ</span>
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

            {/* พรีวิว + ปุ่มอัปโหลด (ถ้าเลือกโหมด standaloneUpload) */}
            {value && (
                <div className="flex items-center gap-3">
                    <div className="relative mt-2 h-40 w-40 overflow-hidden rounded-md border border-[var(--gray-300)]">
                        <Image fill alt="preview" src={URL.createObjectURL(value)} className="object-cover" />
                    </div>

                    {standaloneUpload && (
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="h-10 rounded-md px-4 border bg-[var(--blue-600)] text-white disabled:opacity-60"
                        >
                            {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                        </button>
                    )}
                </div>
            )}

            {/* แสดงลิงก์หลังอัปโหลด (เฉพาะโหมด standaloneUpload) */}
            {standaloneUpload && uploadedUrl && (
                <div className="text-xs text-[var(--gray-700)] break-all">
                    ลิงก์รูป:{" "}
                    <a href={uploadedUrl} target="_blank" className="underline text-[var(--blue-600)]" rel="noreferrer">
                        {uploadedUrl}
                    </a>
                </div>
            )}
        </div>
    );
}