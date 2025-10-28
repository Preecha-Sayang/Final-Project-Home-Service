import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "rsuite";
import { formatThaiDateTimeText } from "lib/client/date/thai";
import ConfirmManageJob from "@/components/dialog/ConfirmManageJob";
import { useRouter } from "next/router";
import PageToolbar from "@/components/technician/common/PageToolbar";

type Job = {
    booking_id: number;
    title: string;
    address_text: string;
    service_date: string | null;
    service_time: string | null;
    order_code: string;
    service_name?: string | null;
    total_price?: number | null;
    // เพิ่มสถานะ (optional เพื่อไม่กระทบที่อื่น)
    status_id?: number | null;
};

const PAGE_SIZE = 10;
// สถานะที่ต้อง “ไม่แสดง” ใน pending
const STATUS_COMPLETED = 3;

export default function TechnicianMyJobs() {
    const [items, setItems] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"soonest" | "latest">("soonest");
    const [page, setPage] = useState(1);
    const [serviceFilter, setServiceFilter] = useState("ทั้งหมด");

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Job | null>(null);
    const [busy, setBusy] = useState(false);

    const router = useRouter();

    // สำหรับเลื่อนขึ้นหัวตารางอย่างนุ่ม ๆ เมื่อเปลี่ยนหน้า (เหมือนหน้า JobTable)
    const topRef = useRef<HTMLDivElement | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("mode", "mine");
            params.set("limit", "200");
            if (q.trim()) params.set("q", q.trim());

            const res = await fetch(`/api/technician/jobs?${params.toString()}`, { cache: "no-store" });
            const data = await res.json();

            const raw: Job[] = Array.isArray(data?.items) ? data.items : [];
            // กรอง Completed ออกไปจาก pending
            const onlyPending = raw.filter((x) => (x?.status_id ?? null) !== STATUS_COMPLETED);

            setItems(onlyPending);
        } finally {
            setLoading(false);
        }
    }, [q]);

    useEffect(() => {
        void load();
    }, [load]);

    const serviceOptions = useMemo(() => {
        const set = new Set<string>();
        items.forEach(i => { if (i.service_name) set.add(i.service_name); });
        return ["ทั้งหมด", ...Array.from(set)];
    }, [items]);

    const filtered = useMemo(() => {
        let arr = [...items];
        if (serviceFilter !== "ทั้งหมด") {
            arr = arr.filter(x => x.service_name === serviceFilter);
        }
        if (q.trim()) {
            const t = q.trim().toLowerCase();
            arr = arr.filter(x =>
                x.title.toLowerCase().includes(t) ||
                x.address_text.toLowerCase().includes(t) ||
                x.order_code.toLowerCase().includes(t)
            );
        }
        arr.sort((a, b) =>
            sort === "soonest"
                ? (a.service_date ?? "").localeCompare(b.service_date ?? "")
                : (b.service_date ?? "").localeCompare(a.service_date ?? "")
        );
        return arr;
    }, [items, q, sort, serviceFilter]);

    // ให้หน้าอยู่ในช่วง valid เสมอเมื่อจำนวนรายการเปลี่ยน (เหมือนหน้า JobTable)
    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
        if (page < 1) setPage(1);
    }, [filtered.length, page]);

    const pageItems = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    function openActions(row: Job, e?: React.MouseEvent<HTMLButtonElement>) {
        if (e) e.stopPropagation(); // กันไม่ให้คลิกทั้งแถว
        setSelected(row);
        setOpen(true);
    }

    function goView(id: number) {
        router.push(`/technician/pending/${id}`);
    }

    async function post(url: string) {
        setBusy(true);
        try {
            const res = await fetch(url, { method: "POST" });
            const data: unknown = await res.json().catch(() => ({}));
            // @ts-expect-error narrow at runtime
            if (res.ok && (data?.ok as boolean)) {
                setOpen(false);
                await load(); // reload แล้วงานที่ complete จะหายจากตารางทันที
            } else {
                // @ts-expect-error narrow at runtime
                alert((data?.message as string) || "อัปเดตสถานะไม่สำเร็จ");
            }
        } finally {
            setBusy(false);
        }
    }

    async function doDecline() {
        if (!selected) return;
        await post(`/api/technician/jobs/${selected.booking_id}/decline`);
    }

    async function doComplete() {
        if (!selected) return;
        await post(`/api/technician/jobs/${selected.booking_id}/complete`);
    }

    return (
        <>
            {/* Search บน Toolbar / ไม่มีตัวกรองอยู่ด้านบนแล้ว */}
            <PageToolbar
                title="รายการที่รอดำเนินการ"
                searchPlaceholder="ค้นหารายการคำสั่งซ่อม"
                searchValue={q}
                onSearchChange={setQ}
            />

            <div className="p-6">
                {/* จุดอ้างอิงไว้เลื่อนกลับขึ้นหัวตารางเมื่อเปลี่ยนหน้า */}
                <div ref={topRef} />

                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <label className="text-sm text-[var(--gray-600)]">บริการ</label>
                    <select
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="h-10 rounded-lg border px-3 text-sm"
                    >
                        {serviceOptions.map(v => <option key={v}>{v}</option>)}
                    </select>

                    <label className="ml-2 text-sm text-[var(--gray-600)]">เรียงตาม</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as "soonest" | "latest")}
                        className="h-10 rounded-lg border px-3 text-sm"
                    >
                        <option value="soonest">วันดำเนินการที่ใกล้ถึง</option>
                        <option value="latest">รายการล่าสุด</option>
                    </select>

                </div>

                {/* ตาราง + แถวคลิกได้ */}
                <div className="rounded-xl border bg-white">
                    <div className="grid grid-cols-12 border-b px-4 py-3 text-sm font-medium text-[var(--gray-600)]">
                        <div className="col-span-5">ชื่อบริการ</div>
                        <div className="col-span-3">วันเวลาที่นัดหมาย</div>
                        <div className="col-span-2">รหัสคำสั่งซ่อม</div>
                        <div className="col-span-1 text-right">ราคารวม</div>
                        <div className="col-span-1 text-right">Action</div>
                    </div>

                    {loading ? (
                        <div className="p-6 text-sm text-[var(--gray-500)]">กำลังโหลด...</div>
                    ) : pageItems.length === 0 ? (
                        <div className="p-6 text-sm text-[var(--gray-500)]">ไม่พบรายการ</div>
                    ) : (
                        pageItems.map(r => (
                            <div
                                key={r.booking_id}
                                className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm cursor-pointer hover:bg-[var(--gray-100)] transition"
                                onClick={() => goView(r.booking_id)}
                            >
                                <div className="col-span-5">
                                    <div className="font-medium">{r.service_name ?? r.title}</div>
                                    <div className="text-[var(--gray-500)] line-clamp-1">{r.address_text}</div>
                                </div>

                                <div className="col-span-3">
                                    {formatThaiDateTimeText(r.service_date, r.service_time)}
                                </div>

                                <div className="col-span-2">{r.order_code}</div>

                                <div className="col-span-1 text-right">
                                    {typeof r.total_price === "number" ? `${r.total_price.toLocaleString()} ฿` : "—"}
                                </div>

                                <div className="col-span-1 text-right">
                                    <button
                                        onClick={(e) => openActions(r, e)}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                                        title="จัดการ"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-[var(--blue-600)] hover:stroke-[var(--blue-900)] transition">
                                            <path
                                                d="M11 4.99992H6C5.46957 4.99992 4.96086 5.21063 4.58579 5.5857C4.21071 5.96078 4 6.46948 4 6.99992V17.9999C4 18.5304 4.21071 19.0391 4.58579 19.4141C4.96086 19.7892 5.46957 19.9999 6 19.9999H17C17.5304 19.9999 18.0391 19.7892 18.4142 19.4141C18.7893 19.0391 19 18.5304 19 17.9999V12.9999M17.586 3.58592C17.7705 3.3949 17.9912 3.24253 18.2352 3.13772C18.4792 3.0329 18.7416 2.97772 19.0072 2.97542C19.2728 2.97311 19.5361 3.02371 19.7819 3.12427C20.0277 3.22484 20.251 3.37334 20.4388 3.56113C20.6266 3.74891 20.7751 3.97222 20.8756 4.21801C20.9762 4.4638 21.0268 4.72716 21.0245 4.99272C21.0222 5.25828 20.967 5.52072 20.8622 5.76473C20.7574 6.00874 20.605 6.22942 20.414 6.41392L11.828 14.9999H9V12.1719L17.586 3.58592Z"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 flex justify-center">
                    <Pagination
                        prev
                        next
                        first
                        last
                        ellipsis
                        boundaryLinks
                        total={filtered.length}
                        limit={PAGE_SIZE}
                        activePage={page}
                        onChangePage={(p: number) => {
                            setPage(p);
                            // เลื่อนขึ้นหัวตารางอย่างนุ่มๆ (เหมือนหน้า JobTable)
                            const top =
                                (topRef.current?.getBoundingClientRect().top ?? 0) +
                                (typeof window !== "undefined" ? window.scrollY : 0) -
                                200;
                            if (typeof window !== "undefined") {
                                window.scrollTo({ top, behavior: "smooth" });
                            }
                        }}
                        size="md"
                    />
                </div>

                <ConfirmManageJob
                    open={open}
                    onClose={() => setOpen(false)}
                    loading={busy}
                    title="จัดการงาน"
                    description={
                        <div className="text-sm text-[var(--gray-700)]">
                            งาน: <b>{selected?.service_name ?? selected?.title}</b><br />
                            รหัส: {selected?.order_code}
                        </div>
                    }
                    declineLabel="ปฏิเสธ / คืนคิว"
                    doneLabel="เสร็จสิ้น"
                    onDecline={doDecline}
                    onDone={doComplete}
                />
            </div>
        </>
    );
}
