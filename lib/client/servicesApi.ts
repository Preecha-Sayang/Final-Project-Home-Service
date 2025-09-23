// API (list/reorder/delete)
import { http } from "./http";
import type { ServiceItem } from "@/types/service";

const BASE = "/services";

export async function listServices() { //ดึงรายการบริการทั้งหมด
    const { data } = await http.get<ServiceItem[]>(BASE);
    return data;
}
export async function getService(id: string) { //ดึงรายละเอียดบริการตาม id
    const { data } = await http.get<ServiceItem>(`${BASE}/${id}`);
    return data;
}
export async function createService(body: Partial<ServiceItem>) { //เพิ่มบริการใหม่
    const { data } = await http.post<ServiceItem>(BASE, body);
    return data;
}
export async function updateService(id: string, body: Partial<ServiceItem>) { //อัปเดตบริการตาม id
    const { data } = await http.patch<ServiceItem>(`${BASE}/${id}`, body);
    return data;
}
export async function deleteService(id: string) { //ลบบริการตาม id
    await http.delete(`${BASE}/${id}`);
}
export async function reorderServices(payload: { id: string; index: number }[]) { //จัดเรียงลำดับบริการใหม่ตาม id และ index
    await http.post(`${BASE}/reorder`, payload);
}