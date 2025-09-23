// ชนิดข้อมูล ServiceItem (types/service.ts)

export type ServiceItem = {
    id: string;
    index: number;
    name: string;
    category: string;
    imageUrl?: string;    // ยัง mock
    createdAt: string;
    updatedAt: string;
    subItems?: SubItem[]; // รายการย่อย (mock)
};

export type SubItem = {
    id: string;           // mock id
    name: string;
    unitName: string;     // หน่วยบริการ (เช่น เครื่อง / จุด / ชม.)
    price: number;
    index: number;        // ลำดับ
};

export type ServicePayload = {
    name: string;
    categoryId: string;
    imageUrl: string;
    items: Array<{ name: string; price: number; unit: string }>;
};

// ตัวเลือกหน่วย (ปรับเพิ่มได้)
export const UNITS = ["ครั้ง", "จุด", "เครื่อง", "ชั่วโมง"];