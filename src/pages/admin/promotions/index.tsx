import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import PromotionsTable from "@/components/admin/promotions/promotions_table";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import type { PromotionRow } from "@/types/promotion";
import { listPromotions, deletePromotion } from "lib/client/promotionsApi";
import { Plus } from "lucide-react";

export default function AdminPromotionPage() {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [rows, setRows] = useState<PromotionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [askDeleteId, setAskDeleteId] = useState<number | null>(null);
    const [doing, setDoing] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const d = await listPromotions();
                setRows(d);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const remove = async (id: number) => {
        setAskDeleteId(id);
    };

    const confirmDelete = async () => {
        if (askDeleteId == null) return;
        setDoing(true);
        try {
            await deletePromotion(askDeleteId);
            setRows((r) => r.filter((x) => x.promotion_id !== askDeleteId));
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setDoing(false);
            setAskDeleteId(null);
        }
    };

    return (
        <>

            <div className="w-full bg-white rounded-2xl border border-[var(--gray-100)] px-5 py-4 mb-6 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <div className="text-xl font-medium text-[var(--gray-900)]">Promotion Code</div>
                <div className="flex items-center gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหา Promotion Code..."
                        className="w-[350px] h-[44px] rounded-lg border border-[var(--gray-300)] px-3 text-sm"
                    />
                    <button
                        className="flex justify-center items-center w-[238px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 gap-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                        onClick={() => router.push("/admin/promotions/new")}
                    >
                        เพิ่ม Promotion Code <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>


            <div className="rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <PromotionsTable
                    rows={rows}
                    onDelete={remove}
                />
            </div>

            <ConfirmDialog
                open={askDeleteId != null}
                title="ลบ Promotion นี้?"
                description="การลบไม่สามารถย้อนกลับได้"
                loading={doing}
                onCancel={() => setAskDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </>
    );
}