import type {
    PromotionId,
    PromotionRow,
    PromotionCreatePayload,
    PromotionUpdatePayload,
    PromotionListOk,
    PromotionOneOk,

} from "@/types/promotion";

export async function listPromotions(): Promise<PromotionRow[]> {
    const r = await fetch("/api/promotions");
    const d: PromotionListOk | { ok: false; message?: string } = await r.json();
    if (!r.ok || !("ok" in d) || !d.ok) throw new Error("Fetch promotions failed.");
    return d.promotions;
}

export async function getPromotion(id: PromotionId): Promise<PromotionRow> {
    const r = await fetch(`/api/promotions/${id}`);
    const d: PromotionOneOk | { ok: false; message?: string } = await r.json();
    if (!r.ok || !("ok" in d) || !d.ok) throw new Error("Fetch promotion failed.");
    return d.promotion;
}

export async function createPromotion(payload: PromotionCreatePayload): Promise<PromotionRow> {
    const r = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const d: PromotionOneOk | { ok: false; message?: string } = await r.json();
    if (!r.ok || !("ok" in d) || !d.ok) throw new Error("Create promotion failed.");
    return d.promotion;
}

export async function updatePromotion(id: PromotionId, payload: PromotionUpdatePayload): Promise<PromotionRow> {
    const r = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const d: PromotionOneOk | { ok: false; message?: string } = await r.json();
    if (!r.ok || !("ok" in d) || !d.ok) throw new Error("Update promotion failed.");
    return d.promotion;
}

export async function deletePromotion(id: PromotionId): Promise<void> {
    const r = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    const d: { ok: boolean; message?: string } = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.message || "Delete promotion failed.");
}