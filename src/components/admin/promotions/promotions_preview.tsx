import React from "react";
import type { PromotionRow } from "@/types/promotion";
import { formatThaiDateTimeAMPM } from "lib/formatDate";

type Props = { item: PromotionRow; onEdit?: () => void };

export default function PromotionPreview({ item, onEdit }: Props) {
    const value = Number(item.discount_value ?? 0);
    const priceText =
        item.discount_type === "percent"
            ? `${value.toFixed(0)}%`
            : `-${value.toFixed(2)}฿`;

    const usageText = (r: PromotionRow) => {
        const used = 0; // API (promotion_usage)
        if (r.usage_limit == null) return "ไม่จำกัด";
        return `${used}/${r.usage_limit}`;
    };

    return (

        <div className="rounded-2xl font-medium text-base border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
            <div className="grid gap-8">
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">Promotion Code</div>
                    <div className="col-span-9">{item.code}</div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">ประเภท</div>
                    <div className="col-span-9">{item.discount_type === "percent" ? "Percent" : "Fixed"}</div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">ราคาที่ลด</div>
                    <div className="col-span-9 text-[var(--red)]">{priceText}</div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">โควต้าการใช้</div>
                    <div className="col-span-9">{usageText(item)} ครั้ง</div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">วันหมดอายุ</div>
                    <div className="col-span-9">{item.expire_at ? formatThaiDateTimeAMPM(item.expire_at) : "-"}</div>
                </div>

                <hr className="my-2 border-[var(--gray-200)]" />

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">สร้างเมื่อ</div>
                    <div className="col-span-9">{formatThaiDateTimeAMPM(item.create_at)}</div>
                </div>
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3 text-[var(--gray-500)]">แก้ไขล่าสุด</div>
                    <div className="col-span-9">{formatThaiDateTimeAMPM(item.update_at)}</div>
                </div>
            </div>
        </div>


    );
}
