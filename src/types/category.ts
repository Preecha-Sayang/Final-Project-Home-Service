

export type CategoryItem = {
    id: number;
    name: string;
    index: number;
    bgColor?: string | null;
    textColor?: string | null;
    ringColor?: string | null;
    createdAt: string;
    updatedAt: string;
    
};

export type SubItem = {
    id: string;
    name: string;
    unitName: string;
    price: number;
    index: number;
};

export type ServicePayload = {
    name: string;
    categoryId: string;
    items: Array<{ name: string; price: number; unit: string }>;
};

// (ก่อน map)
export type ServiceRowRaw = {
    service_id: number;
    servicename: string;
    category_name?: string;
    category_id?: number;
    //สี
    category_bg?: string | null;
    category_text?: string | null;
    category_ring?: string | null;
    image_url?: string | null;

    create_at: string;
    update_at: string;

    subItems?: SubItem[]; //เพิ่ม แก้ any

};

// รูปแบบ response จาก API
export type ListServicesResponse = { ok: boolean; services: unknown[] };
export type GetServiceResponse = { ok: boolean; service: unknown };
export type MutateServiceResponse = { ok: boolean; service: unknown };

// หมวดหมู่
export type CategoryRow = {
    category_id: number;
    name: string;
    description: string | null;
    bg_color_hex: string | null;
    text_color_hex: string | null;
    ring_color_hex: string | null;
    created_at: string;
    updated_at: string;
};
export type ServiceDetail = {
    id: string;
    name: string;
    categoryId: number;
    category: string;
    categoryColor?: { bg?: string | null; text?: string | null; ring?: string | null };
    imageUrl?: string;
    price?: number | null;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
};
export type UnitRow = { unit_id: number; name: string };
export type ListCategoriesResponse = { ok: boolean; categories: CategoryRow[] };

export function mapRowToCategoryItem(r: CategoryRow, i: number): CategoryItem {
    return {
      id: r.category_id,
      name: r.name,
      index: i + 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      bgColor: r.bg_color_hex ?? null,
      textColor: r.text_color_hex ?? null,
      ringColor: r.ring_color_hex ?? null,
    };
}