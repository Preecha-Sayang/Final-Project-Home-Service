import Image from "next/image";
import React from "react";

export default function ImageLightbox({
    src,
    alt,
    open,
    onClose,
}: {
    src: string;
    alt: string;
    open: boolean;
    onClose: () => void;
}) {
    // ปิดด้วย Esc
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleBackdropPointer = (
        e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={handleBackdropPointer}
            onTouchStart={handleBackdropPointer}
        >
            <div
                className="relative w-[60vw] h-[60vh] max-w-5xl max-h-[85vh] animate-[zoomIn_.12s_ease]"
                onClick={(e) => e.stopPropagation()} // กันคลิกทะลุ
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover rounded-xl shadow-2xl transition"
                    priority
                />
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute -top-6 -right-6 rounded-full bg-white/90 hover:bg-white px-5 py-4 text-sm font-semibold shadow cursor-pointer"
                    aria-label="Close"
                    title="ปิด"
                >
                    ✕
                </button>
            </div>
            <style jsx>{`
        @keyframes zoomIn {
          from {
            transform: scale(0.98);
            opacity: 0.6;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
