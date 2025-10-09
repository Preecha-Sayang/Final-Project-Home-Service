import type { PromotionId, PromotionRow, PromotionCreatePayload, PromotionUpdatePayload } from "@/types/promotion";

export type ListParams = {
    q?: string;
    page?: number;
    pageSize?: number;
    sortBy?: keyof PromotionRow;
    order?: "ASC" | "DESC";
};

export async function listPromotions(params: ListParams = {}): Promise<{ items: PromotionRow[]; total: number }> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params.sortBy) qs.set("sortBy", String(params.sortBy));
    if (params.order) qs.set("order", params.order);
    const res = await fetch(`/api/promotions?${qs.toString()}`);
    if (!res.ok) throw new Error("Fetch promotions failed.");
    const json = await res.json() as { ok: true; items: PromotionRow[]; total: number };
    return { items: json.items, total: json.total };
}

export async function getPromotion(id: PromotionId): Promise<PromotionRow> {
    const res = await fetch(`/api/promotions/${id}`);
    if (!res.ok) throw new Error("Fetch promotion failed.");
    const json = await res.json() as { ok: true; promotion: PromotionRow };
    return json.promotion;
}

export async function createPromotion(payload: PromotionCreatePayload): Promise<PromotionRow> {
    const res = await fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json() as { ok: true; promotion: PromotionRow };
    return json.promotion;
}

export async function updatePromotion(id: PromotionId, payload: PromotionUpdatePayload): Promise<PromotionRow> {
    const res = await fetch(`/api/promotions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json() as { ok: true; promotion: PromotionRow };
    return json.promotion;
}

export async function deletePromotion(id: PromotionId): Promise<void> {
    const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
}
