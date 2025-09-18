"use client";
import * as React from "react";
import { cn, labelCls, messageCls } from "./input_style";

export type ImageUploadProps = {
  label?: string;
  hint?: string;
  error?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;       // "image/png,image/jpeg"
  maxSizeMB?: number;    // default 10
  className?: string;
};

export default function ImageUpload({
  label,
  hint,
  error,
  value,
  onChange,
  accept = "image/png,image/jpeg",
  maxSizeMB = 10,
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  React.useEffect(() => {
    if (!value) return setPreview(null);
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!accept.split(",").includes(file.type)) {
      alert("ชนิดไฟล์ไม่ถูกต้อง");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`ไฟล์ใหญ่เกิน ${maxSizeMB}MB`);
      return;
    }
    onChange?.(file);
  };

  return (
    <div className={cn("w-full", className)}>
      {label && <label className={labelCls()}>{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex min-h-[140px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center",
          dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
        )}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="อัพโหลดรูปภาพ"
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="max-h-48 rounded-md object-contain"
          />
        ) : (
          <div className="text-sm text-gray-600">
            <p className="font-medium text-blue-600">อัพโหลดรูปภาพ</p>
            <p className="mt-1 text-xs text-gray-500">
              PNG/JPG ขนาดไม่เกิน {maxSizeMB}MB • คลิกหรือลากไฟล์มาวาง
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.currentTarget.files)}
        />
      </div>

      {error ? (
        <p className={messageCls(true)}>{error}</p>
      ) : hint ? (
        <p className={messageCls()}>{hint}</p>
      ) : null}
    </div>
  );
}
