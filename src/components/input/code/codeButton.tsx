import * as React from "react";
import CodeModal from "./codeModal";

type CodeButtonProps = {
    title: string;
    code: string;
    language?: "tsx" | "ts" | "jsx" | "js" | "html" | "css";
    className?: string;
};

export default function CodeButton({
    title,
    code,
    language = "tsx",
    className,
}: CodeButtonProps) {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`rounded-md border border-[var(--gray-300)] bg-[var(--gray-100)] px-5 py-5.5 mx-2 text-xs hover:bg-[var(--gray-200)] cursor-pointer ${className ?? ""}`}
                aria-label="ดูโค้ดตัวอย่าง"
                title="ดูโค้ดตัวอย่าง"
            >
                {"Code"}
            </button>

            <CodeModal
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                code={code}
                language={language}
            />
        </>
    );
}
