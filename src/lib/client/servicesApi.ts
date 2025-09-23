// API (list/reorder/delete)
import { http } from "./http";
import type { ServiceItem } from "@/types/service";

const BASE = "/services";

export async function listServices(): Promise<ServiceItem[]> {
    const { data } = await http.get<ServiceItem[]>(BASE);
    return data;
}

export async function reorderServices(payload: { id: string; index: number }[]) {
    await http.post(`${BASE}/reorder`, payload);
}

export async function deleteService(id: string) {
    await http.delete(`${BASE}/${id}`);
}
