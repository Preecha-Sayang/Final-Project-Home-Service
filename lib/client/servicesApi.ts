import type { ServiceItem } from "@/types/service";
import { http } from "./http";

const BASE = "/services";

function mapRowToServiceItem(row: any, index = 0): ServiceItem {
    return {
        id: Number(row.service_id),
        name: String(row.servicename),
        category: row.category_name ?? String(row.category_id),
        index: index + 1,
        imageUrl: row.image_url ?? null,
        createdAt: row.create_at,
        updatedAt: row.update_at,
    };
}

/** ดึงรายการบริการทั้งหมด (JOIN หมวดหมู่) */
export async function listServices(): Promise<ServiceItem[]> {
    const { data } = await http.get<{ ok: boolean; services: any[] }>(BASE);
    if (!data?.ok) throw new Error("load services failed");
    return (data.services ?? []).map(mapRowToServiceItem);
}

/** ดึงรายละเอียดบริการตาม id */
export async function getService(id: string | number): Promise<ServiceItem> {
    const { data } = await http.get<{ ok: boolean; service: any }>(`${BASE}/${id}`);
    if (!data?.ok) throw new Error("get service failed");
    return mapRowToServiceItem(data.service, 0);
}

/** เพิ่มบริการใหม่ (ต้องส่ง FormData เพื่อแนบไฟล์รูป) */
export async function createService(fd: FormData): Promise<ServiceItem> {
    // อย่าใส่ 'Content-Type: application/json' เวลาใช้ FormData
    const { data } = await http.post<{ ok: boolean; service: any }>(BASE, fd);
    if (!data?.ok) throw new Error("create failed");
    return mapRowToServiceItem(data.service, 0);
}

/** อัปเดตบริการตาม id (รองรับแนบไฟล์ใหม่ได้) */
export async function updateService(id: string | number, fd: FormData): Promise<ServiceItem> {
    const { data } = await http.patch<{ ok: boolean; service: any }>(`${BASE}/${id}`, fd);
    if (!data?.ok) throw new Error("update failed");
    return mapRowToServiceItem(data.service, 0);
}

/** ลบบริการตาม id (จะลบรูปบน Cloudinary ด้วยที่ฝั่ง API) */
export async function deleteService(id: string | number): Promise<void> {
    const { data, status } = await http.delete<{ ok: boolean; message?: string }>(`${BASE}/${id}`);
    if (!(status >= 200 && status < 300)) throw new Error(data?.message || "delete failed");
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
export async function listCategories(): Promise<Array<{ category_id: number; name: string }>> {
    const { data } = await http.get<{ ok: boolean; categories: Array<{ category_id: number; name: string }> }>("categories");
    if (!data?.ok) throw new Error("load categories failed");
    return data.categories ?? [];
}