import { useRouter } from "next/router";
import React, { useState } from "react";

export default function AdminCategoriesPage() {
    const [search, setSearch] = useState("");
    const router = useRouter();
    return (
        <>
            <div className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-6 flex items-center justify-between">
                <div className="text-xl font-medium text-gray-900">หมวดหมู่</div>
                <div className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาบริการ..."
                        className="h-9 w-64 rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <button
                        onClick={() => router.push("#")}
                        className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer"
                    >
                        + เพิ่มบริการ
                    </button>
                </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                กำลังพัฒนา…
            </div>
        </>
    );
}