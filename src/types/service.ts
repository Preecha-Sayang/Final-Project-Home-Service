// ชนิดข้อมูล ServiceItem (types/service.ts)

export type ServiceItem = {
    id: number;
    name: string;
    category: string;// เพิ่มชื่อหมวด
    categoryId: number;
    index: number;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    subItems?: SubItem[];
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
    imageUrl: string;
    items: Array<{ name: string; price: number; unit: string }>;
};

// (ก่อน map)
export type ServiceRowRaw = {
    service_id: number;
    servicename: string;
    category_name?: string;
    category_id?: number;
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
export type CategoryRow = { category_id: number; name: string };
export type ListCategoriesResponse = { ok: boolean; categories: CategoryRow[] };