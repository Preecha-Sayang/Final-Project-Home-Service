export type Option = { label: string; value: string; disabled?: boolean };
export type Range = { min: number; max: number };

export type FiltersState = {
    q: string;
    category: string;
    price: Range;
    sort: "asc" | "desc" | "recommended" | "popular";// ปรับคีย์ตามที่ DB รองรับได้
    page?: number;
    pageSize?: number;
};

// เอาไว้ setting ตอนจะ fatch นะ
export function toQueryString(f: FiltersState) {
    const usp = new URLSearchParams({
        q: f.q || "",
        category: f.category || "",
        min: String(f.price.min),
        max: String(f.price.max),
        sort: f.sort,
        page: String(f.page ?? 1),
        pageSize: String(f.pageSize ?? 12),
    });
    return usp.toString();
}
