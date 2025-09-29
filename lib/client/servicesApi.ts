import type {
    ServiceItem, //subItem
    ServiceRowRaw,
    ListServicesResponse, GetServiceResponse, MutateServiceResponse,
    CategoryRow, ListCategoriesResponse,
} from "@/types/service";
import { http } from "./http";

const BASE = "/services";

function mapRowToServiceItem(row: Record<string, unknown>, index = 0): ServiceItem {
    const r = row as ServiceRowRaw;
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
    };
}

/** ดึงรายการบริการทั้งหมด */
export async function listServices(): Promise<{ ok: boolean; services: ServiceItem[] }> {
    const { data } = await http.get<ListServicesResponse>(BASE);
    if (!data?.ok) throw new Error("load services failed");
    return {
        ok: true,
        services: (data.services ?? []).map((r, i) =>
            mapRowToServiceItem(r as Record<string, unknown>, i)
        ),
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
    // ใส่ _ แปลว่าจะมาทำต่อ เช่น _payload นะครับทุกคน

    // ถ้าจะบันทึกลำดับจริง:
    // 1) เพิ่มคอลัมน์ position integer not null default 0 ใน services
    // 2) ทำ API PATCH /api/services/reorder รับ [{id, position}]
    // 3) อัปเดตแถวตามนั้น
    return;
}

/** ดึงหมวดหมู่ (สำหรับ dropdown) */
export async function listCategories(): Promise<CategoryRow[]> {
    const { data } = await http.get<ListCategoriesResponse>("categories");
    if (!data?.ok) throw new Error("load categories failed");
    return data.categories ?? [];
}