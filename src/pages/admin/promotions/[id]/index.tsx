import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { PromotionRow } from "@/types/promotion";
import { getPromotion } from "lib/client/promotionsApi";
import PromotionPreview from "@/components/admin/promotions/promotions_preview";
import BackHeader from "@/components/admin/common/BackHeader";

export default function PromotionDetailPage() {
    const router = useRouter();
    const [item, setItem] = useState<PromotionRow | null>(null);
    const [loading, setLoading] = useState(true);

    const numericId = router.isReady
        ? Number(router.query.id)
        : NaN;

    useEffect(() => {
        if (!router.isReady) return;

        if (!numericId || Number.isNaN(numericId)) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const p = await getPromotion(numericId);
                setItem(p);
            } finally {
                setLoading(false);
            }
        })();
    }, [router.isReady, numericId]);

    const goEdit = () => {
        if (!numericId || Number.isNaN(numericId)) return;
        void router.push(`/admin/promotions/${numericId}/edit`);
    };

    if (loading) return <div className="text-[var(--gray-500)]">กำลังโหลด…</div>;
    if (!item) return <div className="text-[var(--gray-500)]">ไม่พบข้อมูล</div>;

    return (
        <>
            <BackHeader
                subtitle="Promotion Code"
                title={item.code}
                backHref="/admin/promotions"
                actions={
                    <button
                        type="button"
                        onClick={goEdit}
                        className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-[var(--gray-100)] hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        แก้ไข
                    </button>
                }
            />

            <PromotionPreview item={item} />
        </>
    );
}