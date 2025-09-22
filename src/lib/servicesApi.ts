// API (list/reorder/delete)

import { ServiceItem } from "@/components/admin/services/type_service";
import { http } from "./http";

const BASE = "/services";

export async function listServices(): Promise<ServiceItem[]> {
    const { data } = await http.get<ServiceItem[]>(`${BASE}`, {
        headers: { "Cache-Control": "no-cache" },
    });
    return data;
}

