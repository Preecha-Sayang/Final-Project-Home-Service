// ชนิดข้อมูล ServiceItem (types/service.ts)

export type ServiceItem = {
    id: number;
    name: string;
    category: string;
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

// ตัวเลือกหน่วย (ปรับเพิ่มได้)
export const UNITS = ["ครั้ง", "จุด", "เครื่อง", "ชั่วโมง"];