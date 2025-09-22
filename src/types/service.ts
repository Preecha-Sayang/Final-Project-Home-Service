// ชนิดข้อมูล ServiceItem (types/service.ts)

export type ServiceItem = {
    id: string;
    index: number;
    name: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export type SubItem = { name: string; price: string; unit: string };
export type ServicePayload = {
    name: string;
    categoryId: string;
    imageUrl: string;
    items: Array<{ name: string; price: number; unit: string }>;
};

// ตัวเลือกหน่วย (ปรับเพิ่มได้)
export const UNITS = ["ครั้ง", "จุด", "เครื่อง", "ชั่วโมง"];