import React from "react";
import { useRouter } from "next/router"
import CategoryEditor from "@/components/admin/categories/editor";

export default function EditCategoryPage() {
    const router = useRouter();
    const id = Number(router.query.id);
    if (!id || Number.isNaN(id)) return null;
    return <CategoryEditor mode="edit" id={id} />;
}