import * as React from "react";
import type { FiltersState, Option, Range } from "./types";
import InputDropdownForServicePage from "@/components/input/inputDropdown/input_dropdown_for_servicepage";
import PriceRange from "@/components/input/inputPriceRange/price_range";
import { usePriceRange } from "@/hooks/usePriceRange";

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
    selectedCategory?: string;  // รับ category ที่เลือกจากภายนอก
};

export default function FiltersBar({
    categories,
    defaultFilters,
    onApply,
    className,
    selectedCategory,
}: Props) {
    // Hook ดึง price range จากฐานข้อมูล
    const { priceRange, loading: priceLoading } = usePriceRange();
    
    // state ภายใน (ให้ component นี้ถือไว้)
    const [q, setQ] = React.useState(defaultFilters?.q ?? "");
    const [category, setCategory] = React.useState(defaultFilters?.category ?? "");
    const [price, setPrice] = React.useState<Range>(
        defaultFilters?.price ?? priceRange
    );
    const [sort, setSort] = React.useState<"asc" | "desc" | "recommended" | "popular">(defaultFilters?.sort ?? "asc");

    // อัปเดต price state เมื่อ priceRange เปลี่ยน
    React.useEffect(() => {
        if (!priceLoading && priceRange && !defaultFilters?.price) {
            setPrice(priceRange);
        }
    }, [priceRange, priceLoading, defaultFilters?.price]);

    // อัปเดต category state เมื่อ selectedCategory เปลี่ยนจากภายนอก
    React.useEffect(() => {
        if (selectedCategory !== undefined) {
            setCategory(selectedCategory);
        }
    }, [selectedCategory]);

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

    // ---------- Price popover (Desktop) ----------
    const [openPriceDesktop, setOpenPriceDesktop] = React.useState(false);
    const [tempPriceDesktop, setTempPriceDesktop] = React.useState<Range>(price);
    React.useEffect(() => setTempPriceDesktop(price), [price]);
    const priceRefDesktop = useClickOutside<HTMLDivElement>(openPriceDesktop, () => setOpenPriceDesktop(false));

    const confirmPriceDesktop = () => {
        setPrice(tempPriceDesktop);
        setOpenPriceDesktop(false);
    };

    // ---------- Price popover (Mobile) ----------
    const [openPriceMobile, setOpenPriceMobile] = React.useState(false);
    const [tempPriceMobile, setTempPriceMobile] = React.useState<Range>(price);
    React.useEffect(() => setTempPriceMobile(price), [price]);
    const priceRefMobile = useClickOutside<HTMLDivElement>(openPriceMobile, () => setOpenPriceMobile(false));

    const confirmPriceMobile = () => {
        setPrice(tempPriceMobile);
        setOpenPriceMobile(false);
    };

    // แสดงช่วงราคาเป็นข้อความ
    const priceLabel = `${price.min.toLocaleString()}–${price.max.toLocaleString()}฿`;

    return (
        <div className={`sticky top-20 z-30 ${className}`}>
        {/* ----------------------------------------------------------- */}
        {/* Desktop Layout */}
        {/* ----------------------------------------------------------- */}
            <div className="hidden xl:flex justify-center bg-white p-4 items-end gap-3 shadow-md">
                {/* Search Box*/}
                <div className="xl:w-[20%]">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="ค้นหาบริการ…"
                            className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none
                         hover:border-[var(--gray-400)]
                         focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden xl:block w-px h-15 bg-gray-200 self-center"></div>

                {/* Category */}
                <div className="xl:w-[18%] flex justify-center relative">
                    <InputDropdownForServicePage
                        label="หมวดหมู่บริการ"
                        options={[
                            { label: "บริการทั้งหมด", value: "" },
                            ...categories
                        ]}
                        value={category}
                        onChange={setCategory}
                        placeholder="เลือกหมวด…"
                    />
                </div>

                {/* Divider */}
                <div className="hidden xl:block w-px h-15 bg-gray-200 self-center"></div>

                {/* Price = ปุ่ม + popup */}
                <div className="xl:w-[10%] flex justify-center" ref={priceRefDesktop}>
                <div className="flex flex-col items-start"> 
                    <label className="w-full block text-xs font-light text-[var(--gray-500)] pb-2">ราคา</label>

                    <button
                        type="button"
                        onClick={() => setOpenPriceDesktop((s) => !s)}
                        className="inline-flex items-center text-base font-medium
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
                    </div>

                    {/* Panel: จัดให้ออกด้านขวาตามแบบ และซ่อน/แสดงด้วย state */}
                    {openPriceDesktop && (
                        <div
                            className="absolute z-50 mt-17 w-[300px] left-4/7 -translate-x-1/2 lg:right-0 lg-left-auto bg-white p-3 shadow-xl"
                        >
                            <PriceRange
                                /* ใช้ค่าจาก priceRange จริง */
                                min={priceRange.min}
                                max={priceRange.max}
                                step={1}
                                value={tempPriceDesktop}
                                onChange={setTempPriceDesktop}
                                onCommit={setTempPriceDesktop}
                                debounceMs={150}
                                enableDebugLogs={false}
                            />
                            <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setOpenPriceDesktop(false)}
                                    className="rounded-md border border-[var(--gray-300)] px-3 py-1.5 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPriceDesktop}
                                    className="rounded-md bg-[var(--blue-600)] px-4 py-1.5 text-sm text-white hover:bg-[var(--blue-700)] cursor-pointer"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="hidden xl:block w-px h-15 bg-gray-200 self-center"></div>

                {/* Sort */}
                <div className="xl:w-[15%] flex justify-center">
                    <InputDropdownForServicePage
                        label="เรียงตาม"
                        value={sort}
                        onChange={(v) => setSort(v as "asc" | "desc" | "recommended" | "popular")}
                        options={[
                            { label: "บริการแนะนำ", value: "recommended" },
                            { label: "บริการยอดนิยม", value: "popular" },
                            { label: "ตามตัวอักษร (ก-ฮ)", value: "asc" },
                            { label: "ตามตัวอักษร (ฮ-ก)", value: "desc" },
                        ]}
                    />
                </div>
                

                {/* Button */}
                <div className="xl:w-[5%]">
                    <button
                        onClick={apply}
                        className="h-[38px] w-full rounded-md bg-[var(--blue-600)] px-3 text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        ค้นหา
                    </button>
                </div>
            </div>
        {/* ----------------------------------------------------------- */}
        {/* Mobile Layout */}
        {/* ----------------------------------------------------------- */}
        <div className="xl:hidden bg-white p-4 items-end shadow-md sm:px-[10%]">
                {/* Search Box + Button*/}
                <div className="flex justify-center gap-2 py-3">
                {/* Search Box*/}
                <div className="w-[75%]">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="ค้นหาบริการ…"
                            className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none
                         hover:border-[var(--gray-400)]
                         focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
                        />
                    </div>
                </div>
                {/* Button*/}
                <div className="w-[25%]">
                    <button
                        onClick={apply}
                        className="h-[38px] w-full rounded-md bg-[var(--blue-600)] px-3 text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        ค้นหา
                    </button>
                </div>
                </div>
                
                {/* Category + Price + Sort */}
                <div className="flex justify-center">
                
                {/* Category : 1/3 */}
                <div className="w-[30%] flex justify-center relative">
                    <InputDropdownForServicePage
                        label="หมวดหมู่บริการ"
                        options={[
                            { label: "บริการทั้งหมด", value: "" },
                            ...categories
                        ]}
                        value={category}
                        onChange={setCategory}
                        placeholder="เลือกหมวด…"
                    />
                </div>

               {/* Divider */}
               <div className="block w-px h-12 bg-gray-200 self-center"></div>

                {/* Price = ปุ่ม + popup */}
                <div className="w-[30%] flex justify-center" ref={priceRefMobile}>
                <div className="items-start grid gap-2"> 
                    <label className="w-full text-xs font-light text-[var(--gray-500)]">ราคา</label>

                    <button
                        type="button"
                        onClick={() => setOpenPriceMobile((s) => !s)}
                        className="items-center text-base font-medium
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
                    </div>

                    {/* Panel: จัดให้ออกด้านขวาตามแบบ และซ่อน/แสดงด้วย state */}
                    {openPriceMobile && (
                        <div
                            className="absolute z-50 mt-17 w-[300px] left-4/7 -translate-x-1/2 lg:right-0 lg-left-auto bg-white p-3 shadow-xl"
                        >
                            <PriceRange
                                /* ใช้ค่าจาก priceRange จริง */
                                min={priceRange.min}
                                max={priceRange.max}
                                step={1}
                                value={tempPriceMobile}
                                onChange={setTempPriceMobile}
                                onCommit={setTempPriceMobile}
                                debounceMs={150}
                                enableDebugLogs={false}
                            />
                            <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                    onClick={() => setOpenPriceMobile(false)}
                                    className="rounded-md border border-[var(--gray-300)] px-3 py-1.5 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPriceMobile}
                                    className="rounded-md bg-[var(--blue-600)] px-4 py-1.5 text-sm text-white hover:bg-[var(--blue-700)] cursor-pointer"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}
                </div>

               {/* Divider */}
                <div className="block w-px h-12 bg-gray-200 self-center"></div>

                {/* Sort */}
                <div className="w-[40%] flex justify-center">
                    <InputDropdownForServicePage
                        label="เรียงตาม"
                        value={sort}
                        onChange={(v) => setSort(v as "asc" | "desc" | "recommended" | "popular")}
                        options={[
                            { label: "บริการแนะนำ", value: "recommended" },
                            { label: "บริการยอดนิยม", value: "popular" },
                            { label: "ตามตัวอักษร (ก-ฮ)", value: "asc" },
                            { label: "ตามตัวอักษร (ฮ-ก)", value: "desc" },
                        ]}
                    />
                </div>
                </div>
            </div>
        </div>
    );
}
