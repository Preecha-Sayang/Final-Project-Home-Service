import type {
    CategoryRow,
    CategoryCreatePayload,
    CategoryUpdatePayload,
    CategoryListOk,
    CategoryOneOk,
    CategoryErr,
    CategoryId,
    ReorderPayload,
} from "@/types/category";

export async function listCategories(): Promise<CategoryRow[]> {
    const r = await fetch("/api/__categories_demo");
    const d = (await r.json()) as CategoryListOk | CategoryErr;
    if (!("ok" in d) || !d.ok) throw new Error((d as CategoryErr).message || "Load failed");
    return d.categories;
}

export async function getCategory(id: CategoryId | string): Promise<CategoryRow> {
    const r = await fetch(`/api/__categories_demo/${id}`);
    const d = (await r.json()) as CategoryOneOk | CategoryErr;
    if (!("ok" in d) || !d.ok) throw new Error((d as CategoryErr).message || "Not found");
    return d.category;
}

export async function createCategory(payload: CategoryCreatePayload): Promise<CategoryRow> {
    const r = await fetch("/api/__categories_demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const d = (await r.json()) as CategoryOneOk | CategoryErr;
    if (!("ok" in d) || !d.ok) throw new Error((d as CategoryErr).message || "Create failed");
    return d.category;
}

export async function updateCategory(
    id: CategoryId | string,
    payload: CategoryUpdatePayload
): Promise<CategoryRow> {
    const r = await fetch(`/api/__categories_demo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const d = (await r.json()) as CategoryOneOk | CategoryErr;
    if (!("ok" in d) || !d.ok) throw new Error((d as CategoryErr).message || "Update failed");
    return d.category;
}

export async function deleteCategory(id: CategoryId | string): Promise<void> {
    const r = await fetch(`/api/__categories_demo/${id}`, { method: "DELETE" });
    if (!r.ok) {
        const d = (await r.json()) as CategoryErr;
        throw new Error(d.message || "Delete failed");
    }
}

export async function reorderCategories(ids: CategoryId[]): Promise<void> {
    const r = await fetch("/api/__categories_demo/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids } satisfies ReorderPayload),
    });
    if (!r.ok) throw new Error("Reorder failed");
}