import { useState } from "react";
import { useRouter } from "next/router";
import PromotionEditor from "@/components/admin/promotions/promotions_editor";
import BackHeader from "@/components/admin/common/BackHeader";

export default function EditPromotionPage() {
    const router = useRouter();
    const id = Number(router.query.id);
    if (!id || Number.isNaN(id)) return null;

    const actions = (
        <div className="flex gap-2">
            <button
                onClick={() => router.push("/admin/promotions")}
                className="w-[112px] h-[44px] rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer"
            >
                ยกเลิก
            </button>
            <button
                type="submit"
                form="service-form"
                className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-[var(--gray-100)] hover:bg-[var(--blue-700)] cursor-pointer"
            >
                บันทึก
            </button>
        </div>
    );



    return (
        <>
            <BackHeader
                subtitle="Promotion Code"
                title="แก้ไขบริการ"
                backHref="/admin/promotions"
                actions={actions}
            />
            <PromotionEditor
                mode="edit"
                id={id}
            />;
        </>
    );

}
