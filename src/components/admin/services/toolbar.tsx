// ช่องค้นหา + ปุ่มเพิ่ม
import React from "react";
import { Search, Plus } from "lucide-react";

type Props = {
    search: string;
    onSearchChange: (v: string) => void;
    onCreate: () => void;
}

export default function Toolbar({ search, onSearchChange, onCreate }: Props) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="relative w-full max-w-[520px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                <input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ค้นหาบริการ..."
                    className="w-full rounded-lg border border-[var(--gray-200)] bg-white pl-9 pr-3 py-2 text-sm outline-none
                     focus:border-[var(--blue-400)] focus:ring-2 focus:ring-[var(--blue-100)]"
                />
            </div>
            <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--blue-600)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] active:bg-[var(--blue-800)]"
            >
                <Plus className="h-4 w-4" />
                เพิ่มบริการ
            </button>
        </div>
    );
}