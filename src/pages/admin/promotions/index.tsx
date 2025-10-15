import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import PromotionsTable from "@/components/admin/promotions/promotions_table";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import type { PromotionRow } from "@/types/promotion";
import { listPromotions, deletePromotion } from "lib/client/promotionsApi";
import { Plus } from "lucide-react";
import { Pagination } from "rsuite";
import LoadingTable from "@/components/common/LoadingTable";

type SortState = { sortBy: keyof PromotionRow; order: "ASC" | "DESC" };

const PAGE_SIZE = 10;

export default function AdminPromotionPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState<PromotionRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [askDeleteId, setAskDeleteId] = useState<number | null>(null);
    const [askDeleteName, setAskDeleteName] = useState<string>("");
    const [doing, setDoing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [sort, setSort] = useState<SortState>({ sortBy: "create_at", order: "DESC" });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { items, total } = await listPromotions({
                    q: search.trim(),
                    page,
                    pageSize: PAGE_SIZE,
                    sortBy: sort.sortBy,
                    order: sort.order,
                });
                setRows(items);
                setTotal(total);
            } finally {
                setLoading(false);
            }
        })();
    }, [search, page, sort]);

    const remove = (id: number) => {
        setAskDeleteId(id);
        const name = rows.find((r) => r.promotion_id === id)?.code ?? "";
        setAskDeleteName(name);
    }

    const confirmDelete = async () => {
        if (askDeleteId == null) return;
        setDoing(true);
        try {
            await deletePromotion(askDeleteId);
            const { items, total } = await listPromotions({
                q: search.trim(),
                page,
                pageSize: PAGE_SIZE,
                sortBy: sort.sortBy,
                order: sort.order,
            });
            setRows(items);
            setTotal(total);
        } catch (e) {
            alert(e instanceof Error ? e.message : String(e));
        } finally {
            setDoing(false);
            setAskDeleteId(null);
        }
    };

    return (
        <>
            <div className="w-full bg-white h-[80px] px-10 py-4 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <div className="text-xl font-medium text-[var(--gray-900)]">Promotion Code</div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            value={search}
                            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                            placeholder="ค้นหา Promotion Code..."
                            className="w-[350px] h-[44px] rounded-lg border border-[var(--gray-300)] px-11 text-sm"
                        />
                        {/* ไอคอนแว่นขยายด้านขวา */}
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L15 15L21 21ZM17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10Z" stroke="#CCD0D7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </div>
                    <button
                        className="flex justify-center items-center w-[238px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 gap-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                        onClick={() => router.push("/admin/promotions/new")}
                    >
                        เพิ่ม Promotion Code <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="p-8">
                {loading ? (
                    <LoadingTable />
                ) : (
                    <>
                        <PromotionsTable
                            rows={rows ?? []}
                            sort={sort}
                            onSort={(s) => { setPage(1); setSort(s); }}
                            onDelete={remove}
                        />
                        <div className="mt-4 px-4 flex justify-between items-center">
                            <div className="text-sm text-[var(--gray-500)]">รวม {total} รายการ</div>
                            <Pagination
                                prev next ellipsis boundaryLinks
                                total={total}
                                limit={PAGE_SIZE}
                                activePage={page}
                                onChangePage={(p) => setPage(p)}
                            />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={askDeleteId != null}
                title="ยืนยันการลบรายการ?"
                description={
                    <>
                        {askDeleteName && (
                            <div className="mt-2 text-base">
                                คุณต้องการลบโค้ด <br /><strong className="font-semibold text-xl text-[var(--red)]">‘{askDeleteName}’</strong><br /> ใช่หรือไม่
                            </div>
                        )}
                    </>
                }
                loading={doing}
                onCancel={() => setAskDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </>
    );
}