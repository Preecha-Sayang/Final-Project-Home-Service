import React from "react";

type Props = {
    className?: string;
};

export default function LoadingTable({ className }: Props) {
    return (
        <div className={["overflow-hidden rounded-t-xl border border-[var(--gray-100)]", className].filter(Boolean).join(" ")}>
            <table className="w-full table-fixed border-collapse">
                <thead>
                    <tr className="h-[48px] bg-[var(--gray-100)] text-base text-[var(--gray-500)]">
                        <th className="w-[180px] px-6 py-3"></th>
                        <th className="w-[100px] px-1 py-3"></th>
                        <th className="w-[140px] px-1 py-3"></th>
                        <th className="w-[140px] px-3 py-1"></th>
                        <th className="w-[220px] px-1 py-3"></th>
                        <th className="w-[220px] px-1 py-3"></th>
                        <th className="w-[120px] px-1 py-3 font-[400]"></th>
                        <th className="w-[120px] px-1 py-3 font-[400]"></th>
                    </tr>
                </thead>
            </table>
        </div>
    );
}
