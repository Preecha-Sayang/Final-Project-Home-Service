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
                type="button"
                onClick={() => router.push("/admin/promotions")}
                className="w-[112px] h-[44px] items-center rounded-lg border border-[var(--blue-600)] bg-white text-base font-medium text-[var(--blue-600)] hover:bg-[var(--gray-100)] cursor-pointer"
            >
                ยกเลิก
            </button>
            <button
                type="submit"
                form="promotion-form"
                className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-[var(--gray-100)] hover:bg-[var(--blue-700)] cursor-pointer">
                บันทึก
            </button>
        </div>
    );



    return (
        <>
            <BackHeader
                subtitle="Promotion Code"
                title="แก้ไข"
                backHref="/admin/promotions"
                actions={actions}
            />
            <div className="p-8">
                <PromotionEditor
                    mode="edit"
                    id={id}
                />
            </div>
        </>
    );

}
