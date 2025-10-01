import type {
    ServiceItem,
    ServiceRowRaw,
    ListServicesResponse,
    GetServiceResponse,
    CreateServiceResponse,
    UpdateServiceResponse,
    CategoryRow,
    ListCategoriesResponse,
} from "@/types/service";
import { http } from "./http";

const BASE = "/services";

/** -----ฟิลด์สีของหมวดหมู่----- */
type CategoryColorAliases = Partial<{
    category_bg: string | null;
    bg_color_hex: string | null;
    category_text: string | null;
    text_color_hex: string | null;
    category_ring: string | null;
    ring_color_hex: string | null;
}>;

type ServiceRowWithAliases = ServiceRowRaw & CategoryColorAliases;

/** -----รวมค่าโทนสีจาก alias(bg/text/ring)----- */
function extractCategoryColor(row: CategoryColorAliases): ServiceItem["categoryColor"] {
    const bg =
        (Object.prototype.hasOwnProperty.call(row, "category_bg") ? row.category_bg : undefined) ??
        (Object.prototype.hasOwnProperty.call(row, "bg_color_hex") ? row.bg_color_hex : undefined) ??
        null;

    const text =
        (Object.prototype.hasOwnProperty.call(row, "category_text") ? row.category_text : undefined) ??
        (Object.prototype.hasOwnProperty.call(row, "text_color_hex") ? row.text_color_hex : undefined) ??
        null;

    const ring =
        (Object.prototype.hasOwnProperty.call(row, "category_ring") ? row.category_ring : undefined) ??
        (Object.prototype.hasOwnProperty.call(row, "ring_color_hex") ? row.ring_color_hex : undefined) ??
        null;

    return { bg, text, ring };
}

/** -----map ServiceItem (ให้ตรง type ปัจจุบัน)----- */
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
        // ถ้ามีใครแนบ subItems มา จะคงค่าไว้ และถ้าไม่มีก็ให้เป็น []
        subItems: Array.isArray(row.subItems) ? row.subItems : [],
        categoryColor,
    };
}

/** -----ดึงรายการบริการทั้งหมด----- */
export async function listServices(): Promise<{ ok: boolean; services: ServiceItem[] }> {
    const { data } = await http.get<ListServicesResponse>(BASE);
    if (!data?.ok) throw new Error("load services failed");

    const rows = (data.services ?? []) as ServiceRowWithAliases[];
    return {
        ok: true,
        services: rows.map((r, i) => mapRowToServiceItem(r, i)),
    };
}

/** -----ดึงบริการเดี่ยว----- */
export async function getService(id: string | number): Promise<ServiceItem> {
    const { data } = await http.get<GetServiceResponse>(`${BASE}/${id}`);
    if (!data?.ok || !data.service) throw new Error("not found");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** -----สร้างบริการใหม่ (FormData)----- */
export async function createService(fd: FormData): Promise<ServiceItem> {
    const { data } = await http.post<CreateServiceResponse>(BASE, fd);
    if (!data?.ok || !data.service) throw new Error("create failed");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** -----อัปเดตบริการ (FormData)----- */
export async function updateService(id: string | number, fd: FormData): Promise<ServiceItem> {
    const { data } = await http.patch<UpdateServiceResponse>(`${BASE}/${id}`, fd);
    if (!data?.ok || !data.service) throw new Error("update failed");

    const row = data.service as ServiceRowWithAliases;
    return mapRowToServiceItem(row, 0);
}

/** -----ลบบริการ----- */
export async function deleteService(id: string | number): Promise<void> {
    await http.delete(`${BASE}/${id}`);
}

/** จัดเรียงลำดับ (ยังไม่บันทึกจริง เพื่อไม่ให้กระทบส่วนอื่น) */
export async function reorderServices(_payload: { id: number; index: number }[]): Promise<void> {
    // ถ้าจะทำจริง:
    // 1) เพิ่มคอลัมน์ position ใน services
    // 2) ทำ API /services/reorder
    // 3) ส่งข้อมูลที่นี่ไปอัปเดต
    return;
}

/** -----ดึงหมวดหมู่ (dropdown)----- */
export async function listCategories(): Promise<CategoryRow[]> {
    const { data } = await http.get<ListCategoriesResponse>("categories");
    if (!data?.ok) throw new Error("load categories failed");
    return data.categories ?? [];
}