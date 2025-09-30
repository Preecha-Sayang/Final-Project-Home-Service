import type {
    ServiceItem, // subItem
    ServiceRowRaw,
    ListServicesResponse,
    GetServiceResponse,
    MutateServiceResponse,
    CategoryRow,
    ListCategoriesResponse,
} from "@/types/service";
import { http } from "./http";

const BASE = "/service_categories";

type CategoryColorAliases = Partial<{
    category_bg: string | null;
    bg_color_hex: string | null;
    category_text: string | null;
    text_color_hex: string | null;
    category_ring: string | null;
    ring_color_hex: string | null;
}>;

type ServiceRowWithAliases = ServiceRowRaw & CategoryColorAliases;

function extractCategoryColor(row: CategoryColorAliases): ServiceItem["categoryColor"] {
    const bg =
        ("category_bg" in row ? row.category_bg : undefined) ??
        ("bg_color_hex" in row ? row.bg_color_hex : undefined) ??
        null;

    const text =
        ("category_text" in row ? row.category_text : undefined) ??
        ("text_color_hex" in row ? row.text_color_hex : undefined) ??
        null;

    const ring =
        ("category_ring" in row ? row.category_ring : undefined) ??
        ("ring_color_hex" in row ? row.ring_color_hex : undefined) ??
        null;

    return { bg, text, ring };
}

function mapRowToServiceItem(row: ServiceRowWithAliases, index = 0): ServiceItem {
    const categoryColor = extractCategoryColor(row);

    return {
        id: Number(row.service_id),
        name: String(row.servicename),
        category: row.category_name ?? String(row.category_id ?? ""),
        categoryId: Number(row.category_id ?? 0),
        index: index + 1,
        imageUrl: row.image_url ?? null,
        createdAt: row.create_at,
        updatedAt: row.update_at,
        subItems: Array.isArray(row.subItems) ? row.subItems : [],
        categoryColor, // ใช้กับ Badge
    };
}

/** ดึงรายการบริการทั้งหมด */
export async function listServices(): Promise<{ ok: boolean; services: ServiceItem[] }> {
    const { data } = await http.get<ListServicesResponse>(BASE);
    if (!data?.ok) throw new Error("load services failed");

    const rows: ServiceRowWithAliases[] = (data.services ?? []) as ServiceRowWithAliases[];
    return {
        ok: true,
        services: rows.map((r, i) => mapRowToServiceItem(r, i)),
    };
}

/** ดึงบริการเดี่ยว */
export async function getService(id: string | number): Promise<ServiceItem> {
    const { data } = await http.get<GetServiceResponse>(`${BASE}/${id}`);
    if (!data?.ok || !data.service) throw new Error("not found");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** สร้างบริการใหม่ */
export async function createService(fd: FormData): Promise<ServiceItem> {
    const { data } = await http.post<MutateServiceResponse>(BASE, fd);
    if (!data?.ok || !data.service) throw new Error("create failed");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** อัปเดตบริการ */
export async function updateService(id: string | number, fd: FormData): Promise<ServiceItem> {
    const { data } = await http.patch<MutateServiceResponse>(`${BASE}/${id}`, fd);
    if (!data?.ok || !data.service) throw new Error("update failed");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** ลบบริการ */
export async function deleteService(id: string | number): Promise<void> {
    await http.delete(`${BASE}/${id}`);
}


/** จัดเรียงลำดับบริการใหม่ (ตอนนี้ทำเป็น no-op ถ้ายังไม่มีคอลัมน์ position ใน DB) */
export async function reorderServices(_payload: { id: number; index: number }[]): Promise<void> {
    // ถ้าจะบันทึกลำดับจริง:
    // 1) เพิ่มคอลัมน์ position integer not null default 0 ใน services
    // 2) ทำ API PATCH /api/services/reorder รับ [{id, position}]
    // 3) อัปเดตแถวตามนั้น
    return;
}

/** ดึงหมวดหมู่ (สำหรับ dropdown) */
export async function listCategories(): Promise<ListCategoriesResponse> {
    // ถ้า http มี base เป็น /api อยู่แล้ว ให้ใช้ "categories"
    const { data } = await http.get<ListCategoriesResponse>("categories");
    if (!data?.ok) throw new Error("load categories failed");
    return data;
}