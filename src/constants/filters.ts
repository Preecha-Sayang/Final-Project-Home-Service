import type { FiltersState } from "@/components/filters";

// ฟังก์ชันสร้าง default filters จาก price range
export function createDefaultFilters(priceRange: { min: number; max: number }): FiltersState {
  return {
    q: "",
    category: "",
    price: priceRange,
    sort: "asc",
    page: 1,
    pageSize: 12,
  };
}
