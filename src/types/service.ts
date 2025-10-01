//** ---- Client Models -------- */
export type ServiceOption = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string | null;
    unit_price: number | null;
};

export type SubItem = {
    id: string;
    name: string;
    unitName: string;
    price: number;
    index: number;
};

export type ServiceItem = {
    id: number;
    name: string;
    category: string; // ชื่อหมวดหมู่ (fallback เป็น categoryId แปลงเป็น string ถ้าไม่มีชื่อ)
    categoryId: number;
    categoryColor?: { bg?: string | null; text?: string | null; ring?: string | null };
    index: number;
    imageUrl?: string | null;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    subItems?: SubItem[]; // (สำรอง)
    options?: ServiceOption[]; // เพิ่ม
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

export type ServicePayload = {
    name: string;
    categoryId: string;
    imageUrl: string;
    items: Array<{ name: string; price: number; unit: string }>;
};

/** ----- DB Row Shapes (Raw) ---------- */

export type ServiceRowRaw = {
    service_id: number;
    servicename: string;
    category_id: number;

    category_name?: string | null;

    // สีจากตาราง service_categories
    category_bg?: string | null;
    category_text?: string | null;
    category_ring?: string | null;

    image_url?: string | null;
    image_public_id?: string | null;

    // เพิ่มเติม ยังไม่ได้ใช้งาน
    price?: string | null; // ตอนนี้จะใช้เป็น min ของราคาต่ำสุดไปก่อน
    description?: string | null;

    create_at: string;// ISO
    update_at: string; // ISO

    // สำหรับหน้าเดิม (สำรอง)
    subItems?: SubItem[];
};

export type OptionRowRaw = {
    service_option_id: number;
    service_id: number;
    name: string;
    unit: string | null;
    unit_price: string | null; // pg numeric แปลงเป็น string
};

/** ------ Category / Unit --------- */

export type CategoryRow = {
    category_id: number;
    name: string;
    description: string | null;
    bg_color_hex: string | null;
    text_color_hex: string | null;
    ring_color_hex: string | null;
    create_at: string;
    update_at: string;
};

export type UnitRow = { unit_id: number; name: string };

/** ------- API Responses ---------- */

// /api/services (GET)
export type ListServicesResponse = {
    ok: true;
    services: ServiceRowRaw[];
};

// /api/services/[id] (GET)
export type GetServiceResponse = {
    ok: true;
    service: ServiceRowRaw;
};

// /api/services (POST) > แนบ options ที่เพิ่งแทรกกลับมา
export type CreateServiceResponse = {
    ok: true;
    service: ServiceRowRaw;
    options: OptionRowRaw[];
};

// /api/services/[id] (PATCH)
export type UpdateServiceResponse = {
    ok: true;
    service: ServiceRowRaw;
};

// /api/services || categories (GET)
export type ListCategoriesResponse = {
    ok: true;
    categories: CategoryRow[];
};

// /api/services/:id/options (GET)
export type ListServiceOptionsResponse = {
    ok: true;
    options: OptionRowRaw[];
};

// /api/services/:id/options (POST || bulk upsert)
export type UpsertServiceOptionsRequest = {
    options: Array<{
        service_option_id?: number;
        name: string;
        unit: string;
        unit_price: number | string;
    }>;
};
export type UpsertServiceOptionsResponse = {
    ok: true;
    options: OptionRowRaw[];
};

// /api/units (GET)
export type ListUnitsResponse = {
    ok: true;
    units: Array<{ name: string }>;
};

// /api/units (POST)
export type CreateUnitRequest = { name: string };
export type CreateUnitResponse = { ok: true; unit: { unit_id: number; name: string } };

/** -------- Error Shape (ถ้าจะใช้รวม) ---------- */
export type ErrorResponse = { ok: false; message?: string };