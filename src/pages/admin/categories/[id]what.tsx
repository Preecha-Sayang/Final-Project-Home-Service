import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CategoryPreview from "@/components/admin/categories/categoty_preview";
import CategoryEditor from "@/components/admin/categories/editor";
import { getCategory } from "lib/client/categoriesApi";
import type { CategoryRow } from "@/types/category";

export default function CategoryDetailPage() {
    const router = useRouter();
    const id = Number(router.query.id);
    const editing = router.query.edit === "1";
    const [item, setItem] = useState<CategoryRow | null>(null);

    useEffect(() => {
        if (!id) return;
        (async () => setItem(await getCategory(id)))();
    }, [id, editing]);

    if (!id) return null;

    return editing ? (
        <CategoryEditor mode="edit" id={id} />
    ) : item ? (
        <CategoryPreview
            item={{
                name: item.name,
                bg_color_hex: item.bg_color_hex,
                text_color_hex: item.text_color_hex,
                ring_color_hex: item.ring_color_hex,
            }}
            onEdit={() => router.push(`/admin/__categories_demo/${id}?edit=1`)}
        />
    ) : (
        <div>Loading…</div>
    );
}