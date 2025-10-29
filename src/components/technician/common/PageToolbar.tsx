// Bar (title + search [+ actions เอาไว้ผูก useState])
import React from "react";

type Props = {
    title: string;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    rightSlot?: React.ReactNode; // ปุ่ม/ตัวกรอง ฯลฯ
};

export default function PageToolbar({
    title,
    searchPlaceholder = "ค้นหา...",
    searchValue,
    onSearchChange,
    rightSlot,
}: Props) {
    return (
        <div className="w-full bg-white h-[80px] px-6 md:px-10 py-4 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            <div className="text-xl font-medium text-[var(--gray-900)]">{title}</div>

            <div className="flex items-center gap-3">
                {typeof onSearchChange === "function" && (
                    <div className="relative">
                        <input
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-[260px] md:w-[350px] h-[44px] rounded-lg border border-[var(--gray-300)] px-11 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L15 15M17 10A7 7 0 1 1 3 10A7 7 0 0 1 17 10Z" stroke="#CCD0D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </div>
                )}

                {rightSlot}
            </div>
        </div>
    );
}
