import * as React from "react";
import type { FiltersState, Option, Range } from "./types";
import InputDropdown from "@/components/input/inputDropdown/input_dropdown";
import PriceRange from "@/components/input/inputPriceRange/price_range";
import { cn } from "@/components/input/_style";

/** hook เล็ก ๆ สำหรับปิดเมื่อคลิกนอก */
function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
    const ref = React.useRef<T>(null);
    React.useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            const el = ref.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open, onClose]);
    return ref;
}

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

    // ---------- Price popover ----------
    const [openPrice, setOpenPrice] = React.useState(false);
    // ค่าชั่วคราวใน popup (เลือกแล้วค่อย OK)
    const [tempPrice, setTempPrice] = React.useState<Range>(price);
    React.useEffect(() => setTempPrice(price), [price]);
    const priceRef = useClickOutside<HTMLDivElement>(openPrice, () => setOpenPrice(false));

    const confirmPrice = () => {
        setPrice(tempPrice);
        setOpenPrice(false);
    };

    // แสดงช่วงราคาเป็นข้อความ
    const priceLabel = `${price.min.toLocaleString()}–${price.max.toLocaleString()}฿`;

    return (
        <div className={className}>
            {/* เดสก์ท็อป = บรรทัดเดียว / มือถือ = wrap ได้เอง */}
            <div
                className={cn(
                    "flex flex-wrap md:flex-nowrap items-end gap-3 rounded-xl border border-[var(--gray-200)] bg-white p-4"
                )}
            >
                {/* Search (ขยายกินที่) */}
                <div className="min-w-[220px] grow">
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
                    </div>
                </div>

                {/* Category */}
                <div className="w-full md:w-[220px]">
                    <InputDropdown
                        label="หมวดหมู่บริการ"
                        options={categories}
                        value={category}
                        onChange={setCategory}
                        placeholder="เลือกหมวด…"
                    />
                </div>

                {/* Price = ปุ่ม + popup */}
                <div className="relative w-full md:w-[240px]" ref={priceRef}>
                    <label className="block text-sm font-medium text-[var(--gray-800)] mb-1">ราคา</label>

                    <button
                        type="button"
                        onClick={() => setOpenPrice((s) => !s)}
                        className="w-full rounded-md border border-[var(--gray-300)] px-3 py-2 text-left text-sm
                       hover:border-[var(--gray-400)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--blue-600)]"
                    >
                        <span className="text-[var(--gray-900)]">{priceLabel}</span>
                        <span className="float-right translate-y-px text-[var(--gray-500)]">
                            {/* caret */}
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                                <path d="M5 7.5 10 12.5 15 7.5" fill="#AAAAAA" />
                            </svg>
                        </span>
                    </button>

                    {/* Panel: จัดให้ออกด้านขวาตามแบบ และซ่อน/แสดงด้วย state */}
                    {openPrice && (
                        <div
                            className="absolute z-50 mt-2 w-[300px] md:right-0 rounded-2xl border border-[var(--gray-200)] bg-white p-3 shadow-xl"
                        >
                            <PriceRange
                                /* ใช้ตัวเดิมเลย แต่ส่ง state ชั่วคราว */
                                min={0}
                                max={2000}
                                step={1}
                                value={tempPrice}
                                onChange={setTempPrice}
                            />
                            <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setOpenPrice(false)}
                                    className="rounded-md border border-[var(--gray-300)] px-3 py-1.5 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPrice}
                                    className="rounded-md bg-[var(--blue-600)] px-4 py-1.5 text-sm text-white hover:bg-[var(--blue-700)] cursor-pointer"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort */}
                <div className="w-full md:w-[260px]">
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
                <div className="w-full md:w-auto md:self-end">
                    <button
                        onClick={apply}
                        className="h-[38px] w-full md:w-auto rounded-md bg-[var(--blue-600)] px-5 text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        </div>
    );
}
