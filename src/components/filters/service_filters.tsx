import * as React from "react";
import type { FiltersState, Option, Range } from "./types";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import PriceRange from "@/components/input/inputPriceRange/price_range";

type Props = {
    categories: Option[];
    defaultFilters?: Partial<FiltersState>;
    onApply: (filters: FiltersState) => void;     // ยิงกลับให้เพจเอาไป fetch เอง
    className?: string;
};

export default function FiltersBar({
    categories,
    defaultFilters,
    onApply,
    className,
}: Props) {
    // state ภายใน (ให้ component นี้ถือไว้)
    const [q, setQ] = React.useState(defaultFilters?.q ?? "");
    const [category, setCategory] = React.useState(defaultFilters?.category ?? "");
    const [price, setPrice] = React.useState<Range>(
        defaultFilters?.price ?? { min: 0, max: 2000 }
    );
    const [sort, setSort] = React.useState<"asc" | "desc">(defaultFilters?.sort ?? "asc");

    const apply = () => {
        onApply({
            q,
            category,
            price,
            sort,
            page: defaultFilters?.page ?? 1,
            pageSize: defaultFilters?.pageSize ?? 12,
        });
    };

    // กด Enter ที่ช่องค้นหา = apply
    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") apply();
    };

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4">
                {/* Search */}
                <div className="min-w-[240px] grow">
                    <label className="block text-sm font-medium text-[var(--gray-800)] mb-1">
                        ค้นหา…
                    </label>
                    <div className="relative">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="ค้นหาบริการ…"
                            className="w-full rounded-md border border-[var(--gray-300)] px-3 py-2 text-sm outline-none
                         hover:border-[var(--gray-400)]
                         focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
                        />
                        {/* ไอคอนแว่นถ้าต้องการ */}
                    </div>
                </div>

                {/* Category */}
                <div className="w-[220px]">
                    <InputDropdown
                        label="หมวดหมู่บริการ"
                        options={categories}
                        value={category}
                        onChange={setCategory}
                        placeholder="เลือกหมวด…"
                    />
                </div>

                {/* Price Range */}
                <div className="w-[260px]">
                    <PriceRange
                        label="ราคา"
                        min={0}
                        max={2000}
                        step={1}
                        value={price}
                        onChange={setPrice}
                    />
                </div>

                {/* Sort */}
                <div className="w-[260px]">
                    <InputDropdown
                        label="เรียงตาม"
                        value={sort}
                        onChange={(v) => setSort(v as "asc" | "desc")}
                        options={[
                            { label: "ตามตัวอักษร (Ascending)", value: "asc" },
                            { label: "ตามตัวอักษร (Descending)", value: "desc" },
                        ]}
                    />
                </div>

                {/* Button */}
                <div className="self-end pb-[2px]">
                    <button
                        onClick={apply}
                        className="rounded-md bg-[var(--blue-600)] px-4 py-2 text-white hover:bg-[var(--blue-700)]"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>
    );
}
