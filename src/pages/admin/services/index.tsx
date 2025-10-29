// ลำดับ | (ไอคอนลาก) | ชื่อบริการ | หมวดหมู่ | สร้างเมื่อ | แก้ไขล่าสุด | Action
import ServiceTable from "@/components/admin/services/service_table";
import { ServiceItem } from "@/types/service";
import { listServices, reorderServices } from "lib/client/servicesApi"; // ลบ deleteService ออก ใช้ fetch ตรงเพื่ออ่าน body error
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import ConfirmDialog from "@/components/dialog/confirm_dialog";
import { Plus } from "lucide-react";
import { Pagination } from "rsuite";
import LoadingTable from "@/components/common/LoadingTable";

const PAGE_SIZE = 30;

/** Popup แสดงสาเหตุลบไม่ได้ */
function InUseDialog({
    open,
    count,
    technicians,
    serviceName,
    onClose,
}: {
    open: boolean;
    count: number;
    technicians: string[];
    serviceName?: string;
    onClose: () => void;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <div className="flex flex-col justify-center items-center w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-semibold text-[var(--red)]">ไม่สามารถลบบริการนี้ได้!</h3>
                <div className="text-base font-semibold">เนื่องจากบริการ</div>
                <div className="flex flex-col justify-center items-center  text-gray-700">
                    <div className="text-xl">
                        {serviceName ? (
                            <>
                                <b>{serviceName}</b>
                            </>
                        ) : null}
                    </div>
                    <div>
                        ถูกใช้งานอยู่ใน <b>{count}</b> รายการจองของช่าง
                    </div>
                </div>

                {technicians.length > 0 && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3">
                        <div className="mb-1 text-sm font-medium text-gray-800">ช่างที่เกี่ยวข้อง (บางส่วน)</div>
                        <ul className="list-inside list-disc text-sm text-gray-700">
                            {technicians.map((t, i) => (
                                <li key={`${t}-${i}`}>{t}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [confirmDel, setConfirmDel] = useState<{ open: boolean; item?: ServiceItem; loading?: boolean }>({
        open: false,
    });
    const [page, setPage] = useState(1);

    // 👉 state สำหรับ popup
    const [inUseOpen, setInUseOpen] = useState(false);
    const [inUseCount, setInUseCount] = useState(0);
    const [inUseTechs, setInUseTechs] = useState<string[]>([]);
    const [inUseServiceName, setInUseServiceName] = useState<string | undefined>(undefined);

    const router = useRouter();

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const { services } = await listServices();
                if (alive) setItems(services);
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }, [items, search]);

    // ตัดหน้า
    const pagedItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    // ลากจัดเรียง > อัปเดต state + ยิง API
    async function handleReorder(nextPageItems: ServiceItem[]) {
        const merged = [...items];
        const filteredStart = (page - 1) * PAGE_SIZE;
        const filteredIdsInPage = filtered.slice(filteredStart, filteredStart + PAGE_SIZE).map((x) => x.id);

        let writeIdx = 0;
        const replaced = merged.map((it) => {
            const pos = filteredIdsInPage.indexOf(it.id);
            if (pos !== -1) {
                const np = nextPageItems[writeIdx++];
                return { ...np };
            }
            return it;
        });

        // re-index ให้ต่อเนื่อง
        const reindexed = replaced.map((x, i) => ({ ...x, index: i + 1 }));
        setItems(reindexed);
        try {
            await reorderServices(reindexed.map((x) => ({ id: x.id, index: x.index })));
        } catch { }
    }

    // ---------- helpers แบบ type-safe สำหรับอ่าน JSON ----------
    type Delete409Payload = {
        count?: number;
        technicians?: unknown;
    };
    type ErrorPayload = { message?: unknown };

    const readNumber = (u: unknown): number | null => (typeof u === "number" ? u : null);

    const readStringArray = (u: unknown): string[] => {
        if (Array.isArray(u)) {
            const allStrings = u.every((v) => typeof v === "string");
            return allStrings ? (u as string[]) : [];
        }
        return [];
    };

    const readMessage = (u: unknown): string | null => {
        if (u && typeof u === "object" && "message" in u) {
            const v = (u as Record<string, unknown>).message;
            return typeof v === "string" ? v : null;
        }
        return null;
    };
    // ------------------------------------------------------------

    // ลบ (ดัก 409 เพื่อโชว์ popup)
    async function handleDelete(item: ServiceItem) {
        // ทำทีละขั้น: ยิง API ก่อน แล้วค่อยปรับ state (จะได้อ่าน body error ได้ชัด)
        const res = await fetch(`/api/services/${item.id}`, { method: "DELETE" });

        if (res.ok) {
            // ลบสำเร็จ → อัปเดตรายการ
            const next = items.filter((x) => x.id !== item.id).map((x, i) => ({ ...x, index: i + 1 }));
            setItems(next);
            const totalAfter = filtered.length - 1;
            const maxPage = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
            if (page > maxPage) setPage(maxPage);
            return;
        }

        if (res.status === 409) {
            // ลบไม่ได้เพราะมีการใช้งาน → เปิด popup พร้อม count/รายชื่อช่าง
            const data = (await res.json().catch(() => null)) as unknown as Delete409Payload | null;
            const cnt = data && "count" in data ? readNumber((data as Delete409Payload).count) : null;
            const techs = data && "technicians" in data ? readStringArray((data as Delete409Payload).technicians) : [];

            setInUseCount(cnt ?? 0);
            setInUseTechs(techs);
            setInUseServiceName(item.name);
            setInUseOpen(true);
            return;
        }

        // error อื่น ๆ
        const err = (await res.json().catch(() => null)) as unknown as ErrorPayload | null;
        const msg = err ? readMessage(err) : null;
        alert(msg || "ลบไม่สำเร็จ");
    }

    return (
        <>
            <div className="w-full bg-white h-[80px] px-10 py-4 flex items-center justify-between shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                <div className="text-xl font-medium text-[var(--gray-900)]">รายการ</div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="ค้นหาบริการ..."
                            className="w-[350px] h-[44px] rounded-lg border border-[var(--gray-300)] px-11 text-sm"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M21 21L15 15L21 21ZM17 10C17 10.9193 16.8189 11.8295 16.4672 12.6788C16.1154 13.5281 15.5998 14.2997 14.9497 14.9497C14.2997 15.5998 13.5281 16.1154 12.6788 16.4672C11.8295 16.8189 10.9193 17 10 17C9.08075 17 8.1705 16.8189 7.32122 16.4672C6.47194 16.1154 5.70026 15.5998 5.05025 14.9497C4.40024 14.2997 3.88463 13.5281 3.53284 12.6788C3.18106 11.8295 3 10.9193 3 10C3 8.14348 3.7375 6.36301 5.05025 5.05025C6.36301 3.7375 8.14348 3 10 3C11.8565 3 13.637 3.7375 14.9497 5.05025C16.2625 6.36301 17 8.14348 17 10Z"
                                    stroke="#CCD0D7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </div>
                    <button
                        onClick={() => router.push("/admin/services/new")}
                        className="flex justify-center items-center w-[148px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 gap-2 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                    >
                        เพิ่มบริการ <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="p-8">
                {loading ? (
                    <LoadingTable />
                ) : (
                    <>
                        <ServiceTable
                            items={pagedItems}
                            search={search}
                            onEdit={(item) => router.push(`/admin/services/${item.id}/edit`)}
                            onDelete={(item) => setConfirmDel({ open: true, item, loading: false })}
                            onReorder={handleReorder}
                            onView={(item) => router.push(`/admin/services/${item.id}`)}
                        />

                        {/* Pagination */}
                        <div className="mt-4 px-4 flex justify-between items-center">
                            <div className="text-sm text-[var(--gray-500)]">รวม {filtered.length} รายการ</div>
                            <Pagination prev next ellipsis boundaryLinks total={filtered.length} limit={PAGE_SIZE} activePage={page} onChangePage={(p) => setPage(p)} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={confirmDel.open}
                title="ยืนยันการลบรายการ?"
                description={
                    <>
                        {confirmDel && (
                            <div className="mt-2 text-base">
                                คุณต้องการลบบริการ <br />
                                <strong className="font-semibold text-xl text-[var(--red)]">‘{confirmDel.item?.name}’</strong>
                                <br /> ใช่หรือไม่
                            </div>
                        )}
                    </>
                }
                loading={!!confirmDel.loading}
                onCancel={() => setConfirmDel({ open: false })}
                onConfirm={async () => {
                    if (!confirmDel.item) return;
                    setConfirmDel((s) => ({ ...s, loading: true }));
                    await handleDelete(confirmDel.item);
                    setConfirmDel({ open: false, item: undefined, loading: false });
                }}
            />

            {/* Popup แสดงจำนวนที่ใช้งาน + รายชื่อช่าง */}
            <InUseDialog
                open={inUseOpen}
                count={inUseCount}
                technicians={inUseTechs}
                serviceName={inUseServiceName}
                onClose={() => setInUseOpen(false)}
            />
        </>
    );
}
