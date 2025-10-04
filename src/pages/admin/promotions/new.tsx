import React from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import BackHeaderPromotions from "@/components/admin/common/BackHeader_promotions";
import { Code } from "lucide-react";

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
                form="service-form"
                className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] text-base font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
            >
                สร้าง
            </button>
        </div>
    );

    return (
        <>
            <BackHeaderPromotions
                subtitle="Promotion Code"
                title="แก้ไข"
                backHref="/admin/promotions"
                actions={actions}

            />
            <PromotionEditor
                mode="create"
            />;
        </>
    )

}
