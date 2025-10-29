

export type CategoryId = number;

export type HexColor = `#${string}`;

export type CategoryRow = {
    category_id: number;
    name: string;
    description?: string | null;
    create_at: string;
    update_at: string;
    bg_color_hex: HexColor;
    text_color_hex: HexColor;
    ring_color_hex: HexColor;
    position: number;
};

export type CategoryCreatePayload = {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
    ring_color_hex: string;
    admin_id: number;
};

export type CategoryCreateInput = {
    name: string;
    bg_color_hex: string;
    text_color_hex: string;
    ring_color_hex: string;
    admin_id: number;
};

export type CategoryUpdateInput = Partial<CategoryCreateInput> & {
    position?: number;
};

export type CategoryUpdatePayload = Partial<CategoryCreatePayload> & {
};

export type CategoryListOk = { ok: true; categories: CategoryRow[] };
export type CategoryOneOk = { ok: true; category: CategoryRow };
export type CategoryErr = { ok: false; message?: string };

export type ReorderPayload = { ids: CategoryId[] }; // จากซ้ายบนลงล่าง (index = position)