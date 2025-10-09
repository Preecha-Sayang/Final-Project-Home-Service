import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import BackHeader from "@/components/admin/common/BackHeader";

const PromotionEditor = dynamic(() => import("@/components/admin/promotions/promotions_editor"), { ssr: false });

export default function NewPromotionPage() {

    const router = useRouter();
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
                className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] text-base font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer">
                สร้าง
            </button>
        </div>
    );

    return (
        <>
            <BackHeader
                subtitle="Promotion Code"
                title="เพิ่ม"
                backHref="/admin/promotions"
                actions={actions}

            />
            <div className="p-8">
                <PromotionEditor
                    mode="create"
                />
            </div>

        </>
    )

}
