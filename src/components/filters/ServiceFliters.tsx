import { useState, useEffect } from 'react';
import InputDropdown from '../input/inputDropdown';
import PriceRange from '@/components/input/inputPriceRange/price_range';
import type { ServiceFilters as ServiceFiltersType, SelectOption, PriceRange as PriceRangeType } from '@/types/service.types';
import { SORT_OPTIONS } from '@/constants/service.constants';

interface ServiceFiltersProps {
  categories: SelectOption[];
  priceRange: PriceRangeType;
  defaultFilters: ServiceFiltersType;
  selectedCategory?: string;
  onApply: (filters: ServiceFiltersType) => void;
  className?: string;
}

// ===== Sub-components =====
const SearchIcon = () => (
  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

interface PriceFilterProps {
  priceRange: PriceRangeType;
  currentPrice: PriceRangeType;
  onConfirm: (price: PriceRangeType) => void;
}

const PriceFilter = ({ priceRange, currentPrice, onConfirm }: PriceFilterProps) => {
  const [open, setOpen] = useState(false);
  const [tempPrice, setTempPrice] = useState(currentPrice);

  useEffect(() => {
    setTempPrice(currentPrice);
  }, [currentPrice]);

  const priceLabel = `${currentPrice.min.toLocaleString()}–${currentPrice.max.toLocaleString()}฿`;

  const handleConfirm = () => {
    onConfirm(tempPrice);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-start">
        <label className="w-full block text-xs font-light text-[var(--gray-500)] pb-2">
          ราคา
        </label>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-[var(--blue-600)] rounded cursor-pointer"
        >
          <span className="text-[var(--gray-900)]">{priceLabel}</span>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5 10 12.5 15 7.5" fill="#AAAAAA" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          
          {/* Popover */}
          <div className="absolute z-50 mt-2 w-[300px] left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 bg-white p-3 shadow-xl rounded-lg border border-gray-200">
            <PriceRange
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              value={tempPrice}
              onChange={setTempPrice}
              onCommit={setTempPrice}
              debounceMs={150}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--gray-300)] px-3 py-1.5 text-sm text-[var(--gray-700)] hover:bg-[var(--gray-100)] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-md bg-[var(--blue-600)] px-4 py-1.5 text-sm text-white hover:bg-[var(--blue-700)] cursor-pointer"
              >
                ตกลง
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== Main Component =====
export default function ServiceFiltersBar({
  categories,
  priceRange,
  defaultFilters,
  selectedCategory,
  onApply,
  className
}: ServiceFiltersProps) {
  // Local state
  const [q, setQ] = useState(defaultFilters.q);
  const [category, setCategory] = useState(defaultFilters.category);
  const [price, setPrice] = useState(defaultFilters.price);
  const [sort, setSort] = useState(defaultFilters.sort);

  // Sync with external category selection
  useEffect(() => {
    if (selectedCategory !== undefined) {
      setCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Sync price with priceRange changes
  useEffect(() => {
    if (priceRange && !defaultFilters.price) {
      setPrice(priceRange);
    }
  }, [priceRange, defaultFilters.price]);

  const handleApply = () => {
    onApply({ q, category, price, sort, page: 1, pageSize: 12 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className={`sticky top-20 z-30 bg-white shadow-md ${className || ''}`}>
      {/* Desktop Layout */}
      <div className="hidden xl:flex justify-center p-4 items-end gap-3">
        {/* Search */}
        <div className="xl:w-[20%]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ค้นหาบริการ…"
              className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none hover:border-[var(--gray-400)] focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
            />
          </div>
        </div>

        <div className="w-px h-15 bg-gray-200" />

        {/* Category */}
        <div className="xl:w-[18%]">
          <InputDropdown
            label="หมวดหมู่บริการ"
            variant="compact"
            options={categories}
            value={category}
            onChange={setCategory}
            placeholder="เลือกหมวด…"
          />
        </div>

        <div className="w-px h-15 bg-gray-200" />

        {/* Price */}
        <div className="xl:w-[10%]">
          <PriceFilter
            priceRange={priceRange}
            currentPrice={price}
            onConfirm={setPrice}
          />
        </div>

        <div className="w-px h-15 bg-gray-200" />

        {/* Sort */}
        <div className="xl:w-[15%]">
          <InputDropdown
            label="เรียงตาม"
            variant="compact"
            value={sort}
            onChange={(v) => setSort(v as ServiceFiltersType['sort'])}
            options={Array.from(SORT_OPTIONS)}
          />
        </div>

        {/* Search Button */}
        <div className="xl:w-[5%]">
          <button
            onClick={handleApply}
            className="h-[38px] w-full rounded-md bg-[var(--blue-600)] px-3 text-white hover:bg-[var(--blue-700)] cursor-pointer"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden p-4 sm:px-[10%]">
        {/* Search + Button */}
        <div className="flex gap-2 pb-3">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ค้นหาบริการ…"
                className="w-full rounded-md border border-[var(--gray-300)] pl-10 pr-3 py-2 text-sm outline-none hover:border-[var(--gray-400)] focus:ring-2 focus:ring-[var(--blue-600)] focus:border-[var(--blue-600)]"
              />
            </div>
          </div>
          <button
            onClick={handleApply}
            className="h-[38px] px-6 rounded-md bg-[var(--blue-600)] text-white hover:bg-[var(--blue-700)] cursor-pointer"
          >
            ค้นหา
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex justify-center gap-2">
          <div className="flex-1">
            <InputDropdown
              label="หมวดหมู่บริการ"
              variant="compact"
              options={categories}
              value={category}
              onChange={setCategory}
              placeholder="เลือกหมวด…"
            />
          </div>

          <div className="w-px bg-gray-200" />

          <div className="flex-1">
            <PriceFilter
              priceRange={priceRange}
              currentPrice={price}
              onConfirm={setPrice}
            />
          </div>

          <div className="w-px bg-gray-200" />

          <div className="flex-1">
            <InputDropdown
              label="เรียงตาม"
              variant="compact"
              value={sort}
              onChange={(v) => setSort(v as ServiceFiltersType['sort'])}
              options={Array.from(SORT_OPTIONS)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}