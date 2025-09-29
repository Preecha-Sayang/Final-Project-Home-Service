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

const BASE = "/services";

function mapRowToServiceItem(row: Record<string, unknown>, index = 0): ServiceItem {
    const r = row as ServiceRowRaw;

    // รองรับได้ทั้ง alias จาก API (category_bg / category_text / category_ring)
    // และชื่อคอลัมน์เดิมในตาราง (bg_color_hex / text_color_hex / ring_color_hex)
    const categoryColor = {
        bg:
            (r as any).category_bg ??
            (r as any).bg_color_hex ??
            null,
        text:
            (r as any).category_text ??
            (r as any).text_color_hex ??
            null,
        ring:
            (r as any).category_ring ??
            (r as any).ring_color_hex ??
            null,
    } as ServiceItem["categoryColor"];

    return {
        id: Number(r.service_id),
        name: String(r.servicename),
        category: r.category_name ?? String(r.category_id ?? ""),
        categoryId: Number(r.category_id ?? 0),
        index: index + 1,
        imageUrl: r.image_url ?? null,
        createdAt: r.create_at,
        updatedAt: r.update_at,
        subItems: r.subItems ?? [],
        categoryColor, // <-- เพิ่มเข้ามาเพื่อใช้กับ Badge
    };
}

/** ดึงรายการบริการทั้งหมด */
export async function listServices(): Promise<{ ok: boolean; services: ServiceItem[] }> {
    const { data } = await http.get<ListServicesResponse>(BASE);
    if (!data?.ok) throw new Error("load services failed");
    return {
        ok: true,
        services: (data.services ?? []).map((r, i) => mapRowToServiceItem(r as Record<string, unknown>, i)),
    };
}

/** ดึงบริการเดี่ยว */
export async function getService(id: string | number): Promise<ServiceItem> {
    const { data } = await http.get<GetServiceResponse>(`${BASE}/${id}`);
    if (!data?.ok || !data.service) throw new Error("not found");
    return mapRowToServiceItem(data.service as Record<string, unknown>, 0);
}

/** สร้างบริการใหม่ */
export async function createService(fd: FormData): Promise<ServiceItem> {
    const { data } = await http.post<MutateServiceResponse>(BASE, fd);
    if (!data?.ok || !data.service) throw new Error("create failed");
    return mapRowToServiceItem(data.service as Record<string, unknown>, 0);
}

/** อัปเดตบริการ */
export async function updateService(id: string | number, fd: FormData): Promise<ServiceItem> {
    const { data } = await http.patch<MutateServiceResponse>(`${BASE}/${id}`, fd);
    if (!data?.ok || !data.service) throw new Error("update failed");
    return mapRowToServiceItem(data.service as Record<string, unknown>, 0);
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
export async function listCategories(): Promise<CategoryRow[]> {
    // ถ้า http ตั้ง base เป็น /api อยู่แล้ว ให้ใช้ "categories"
    // ถ้าไม่ใช่ ให้ใช้ "/categories" หรือ "/api/categories" ให้ตรงกับ config
    const { data } = await http.get<ListCategoriesResponse>("categories");
    if (!data?.ok) throw new Error("load categories failed");
    return data.categories ?? [];
}
