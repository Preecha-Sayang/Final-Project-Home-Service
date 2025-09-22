import * as React from "react";
import { X, Check } from "lucide-react";

type CodeModalProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    code: string;
    language?: "tsx" | "ts" | "jsx" | "js" | "html" | "css";
};

export default function CodeModal({
    open,
    onClose,
    title = "Code example",
    code,
    language = "tsx",
}: CodeModalProps) {
    const [copied, setCopied] = React.useState(false);
    const titleId = React.useId();

    // เพิ่ม:เวลากด popup ไม่ให้หน้าเว็บขยับ
    React.useEffect(() => {
        if (!open) {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            return;
        }
        const doc = document.documentElement;
        const scrollbarWidth = window.innerWidth - doc.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onEsc);

        return () => {
            window.removeEventListener("keydown", onEsc);
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.log("Copy fail!", e)
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] grid place-items-center overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}>
            <button
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />
            <div
                className="relative w-[min(700px,92vw)] max-h-[min(80vh,700px)] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
                    <h2 id={titleId} className="text-sm font-medium text-[var(--gray-800)]">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1 rounded-md border border-[var(--gray-300)] px-3 py-1.5 text-xs hover:bg-[var(--gray-100)] cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="size-3.5" /> Copied
                                </>
                            ) : (
                                "Copy"
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-md border border-[var(--gray-300)] p-1.5 hover:bg-[var(--gray-100)] cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </div>

                {/* ทำให้กด popup หน้าไม่ขยับ */}
                <div className="flex-1 overflow-auto p-5">
                    <pre className="rounded-xl bg-[var(--gray-900)] p-4 text-[12.5px] leading-relaxed text-[var(--gray-100)] overflow-auto">
                        <code className={`language-${language}`}>{code}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
