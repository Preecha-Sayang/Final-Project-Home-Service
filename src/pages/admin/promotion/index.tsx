import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

export default function AdminPromotionPage() {
    const [search, setSearch] = useState("");
    const router = useRouter();
    return (
        <>
            <div className="w-full bg-white rounded-2xl border border-[var(--gray-100)] px-5 py-4 mb-6 flex items-center justify-between">
                <div className="text-xl font-medium text-[var(--gray-900)]">Promotion Code</div>
                <div className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหา Promotion Code..."
                        className="h-9 w-64 rounded-lg border border-[var(--gray-300)] px-3 text-sm"
                    />
                    <button
                        onClick={() => router.push("#")}
                        className="h-9 rounded-lg bg-[var(--blue-600)] px-6 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        เพิ่ม Promotion Code +
                    </button>
                </div>
            </div>
            <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                กำลังพัฒนา…
            </div>
        </>
    );
}