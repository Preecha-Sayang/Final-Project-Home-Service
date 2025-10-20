// Header แบบย้อนกลับ (เพิ่มให้ใช้ได้ทุกหน้า)
import React from "react";
import { useRouter } from "next/router";

type Props = {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    actions?: React.ReactNode; // ปุ่มขวา
};

export default function BackHeader({ title, subtitle, onBack, actions }: Props) {
    const router = useRouter();

    const goBack = () => {
        if (onBack) onBack();
        else router.back();
    };

    return (
        <div className="w-full bg-white h-[80px] px-6 md:px-10 py-4 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={goBack}
                    className="h-10 w-10 grid place-items-center rounded-lg border border-[var(--gray-300)] hover:bg-[var(--gray-100)] cursor-pointer"
                    aria-label="ย้อนกลับ"
                    title="ย้อนกลับ"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div>
                    {subtitle && <div className="text-xs text-[var(--gray-500)]">{subtitle}</div>}
                    <div className="text-xl font-medium text-[var(--gray-900)]">{title}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">{actions}</div>
        </div>
    );
}
