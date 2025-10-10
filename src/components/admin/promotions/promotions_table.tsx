import React from "react";
import { useRouter } from "next/router";
import type { PromotionRow } from "@/types/promotion";
import { formatThaiDateTimeAMPM } from "lib/formatDate";

type SortState = { sortBy: keyof PromotionRow; order: "ASC" | "DESC" };

type Props = {
    rows: PromotionRow[];
    sort: SortState;
    onSort: (s: SortState) => void;
    onDelete?: (id: number) => void;
};

export default function PromotionsTable({ rows, sort, onSort, onDelete }: Props) {
    const router = useRouter();

    const priceText = (r: PromotionRow) =>
        r.discount_type === "fixed"
            ? `- ${Number(r.discount_value).toFixed(2)}฿`
            : `- ${Number(r.discount_value).toFixed(0)}%`;

    const usageText = (r: PromotionRow) => {
        const used = 0; // API (promotion_usage)
        if (r.usage_limit == null) return "ไม่จำกัด";
        return `${used}/${r.usage_limit}`;
    };

    const th = (label: string, key: keyof PromotionRow) => {
        const active = sort.sortBy === key;
        const dir = active ? (sort.order === "ASC" ? "▲" : "▼") : "";
        return (
            <button
                type="button"
                className="w-full text-left font-[400] hover:underline cursor-pointer transition"
                onClick={() =>
                    onSort({
                        sortBy: key,
                        order: active ? (sort.order === "ASC" ? "DESC" : "ASC") : "ASC",
                    })
                }
            >
                {label} {dir}
            </button>
        );
    };

    const goPreview = (id: number) => {
        router.push(`/admin/promotions/${id}`);
    };

    return (
        <div className="overflow-hidden rounded-xl border border-[var(--gray-100)]">
            <table className="w-full table-fixed border-collapse">
                <thead>
                    <tr className="bg-[var(--gray-100)] text-base text-[var(--gray-500)]">
                        <th className="w-[180px] px-6 py-3">{th("Promotion Code", "code")}</th>
                        <th className="w-[100px] px-1 py-3">{th("ประเภท", "discount_type")}</th>
                        <th className="w-[140px] px-1 py-3">{th("โควต้าการใช้(ครั้ง)", "usage_limit")}</th>
                        <th className="w-[140px] px-3 py-1">{th("ราคาที่ลด", "discount_value")}</th>
                        <th className="w-[220px] px-1 py-3">{th("สร้างเมื่อ", "create_at")}</th>
                        <th className="w-[220px] px-1 py-3">{th("วันหมดอายุ", "expire_at")}</th>
                        <th className="w-[120px] px-1 py-3 font-[400]">สถานะ</th>
                        <th className="w-[120px] px-1 py-3 font-[400]">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((r) => {
                        const now = Date.now();
                        const expired = r.expire_at ? new Date(r.expire_at).getTime() < now : false;
                        return (
                            <tr
                                key={r.promotion_id}
                                className="group h-[88px] border-t border-[var(--gray-100)] text-base font-[400] hover:bg-[var(--gray-100)] cursor-pointer transition"
                                onClick={() => goPreview(r.promotion_id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") goPreview(r.promotion_id);
                                }}
                                role="button"
                                tabIndex={0}
                                title="ดูรายละเอียด"
                            >
                                <td className="pl-6 py-3 font-medium text-left">{r.code}</td>
                                <td className="px-1 py-3 text-left">{r.discount_type === "fixed" ? "Fixed" : "Percent"}</td>
                                <td className="px-1 py-3 text-left">{usageText(r)}</td>
                                <td className="px-3 py-3 font-medium text-left text-[var(--red)]">{priceText(r)}</td>
                                <td className="px-1 py-3 text-left">{formatThaiDateTimeAMPM(r.create_at)}</td>
                                <td className="px-1 py-3 text-left">{r.expire_at ? formatThaiDateTimeAMPM(r.expire_at) : "-"}</td>

                                {/* สถานะ */}
                                <td className="px-1 py-3 text-center">
                                    <span
                                        aria-label={expired ? "หมดอายุ" : "ใช้งานได้"}
                                        title={expired ? "หมดอายุ" : "ใช้งานได้"}
                                        className={[
                                            "inline-block h-4 w-4 rounded-full align-middle",
                                            "ring-2 ring-black/5",
                                            "shadow-[inset_0_1px_3px_rgba(255,255,255,.35)]",
                                            expired ? "bg-[#E74C3C]" : "bg-[#2ECC71]"
                                        ].join(" ")}
                                    />
                                </td>

                                <td className="px-1 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--red)] cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); onDelete?.(r.promotion_id); }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-[var(--gray-400)] hover:stroke-[var(--red)] transition">
                                                <path
                                                    d="M4 7H20M19 7L18.133 19.142C18.0971 19.6466 17.8713 20.1188 17.5011 20.4636C17.1309 20.8083 16.6439 21 16.138 21H7.862C7.35614 21 6.86907 20.8083 6.49889 20.4636C6.1287 20.1188 5.90292 19.6466 5.867 19.142L5 7H19ZM10 11V17V11ZM14 11V17V11ZM15 7V4C15 3.73478 14.8946 3.48043 14.7071 3.29289C14.5196 3.10536 14.2652 3 14 3H10C9.73478 3 9.48043 3.10536 9.29289 3.29289C9.10536 3.48043 9 3.73478 9 4V7H15Z"
                                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            className="rounded-md p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] hover:text-[var(--blue-700)] cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/promotions/${r.promotion_id}/edit`); }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-[var(--blue-600)] hover:stroke-[var(--blue-900)] transition">
                                                <path
                                                    d="M11 4.99992H6C5.46957 4.99992 4.96086 5.21063 4.58579 5.5857C4.21071 5.96078 4 6.46948 4 6.99992V17.9999C4 18.5304 4.21071 19.0391 4.58579 19.4141C4.96086 19.7892 5.46957 19.9999 6 19.9999H17C17.5304 19.9999 18.0391 19.7892 18.4142 19.4141C18.7893 19.0391 19 18.5304 19 17.9999V12.9999M17.586 3.58592C17.7705 3.3949 17.9912 3.24253 18.2352 3.13772C18.4792 3.0329 18.7416 2.97772 19.0072 2.97542C19.2728 2.97311 19.5361 3.02371 19.7819 3.12427C20.0277 3.22484 20.251 3.37334 20.4388 3.56113C20.6266 3.74891 20.7751 3.97222 20.8756 4.21801C20.9762 4.4638 21.0268 4.72716 21.0245 4.99272C21.0222 5.25828 20.967 5.52072 20.8622 5.76473C20.7574 6.00874 20.605 6.22942 20.414 6.41392L11.828 14.9999H9V12.1719L17.586 3.58592Z"
                                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {/* {rows.length === 0 && (
                        <tr>
                            <td colSpan={8} className="py-10 text-center text-[var(--gray-500)]">
                                ไม่พบรายการ
                            </td>
                        </tr>
                    )} */}
                </tbody>
            </table>
        </div>
    );
}
