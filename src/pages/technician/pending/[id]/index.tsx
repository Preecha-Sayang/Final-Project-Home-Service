import React from "react";
import BackHeader from "@/components/technician/common/BackHeader";

export default function TechnicianPendingDetailPage() {
    return (
        <>
            <BackHeader
                subtitle="รายละเอียดงาน"
                title="ชื่องาน/บริการ"
                actions={
                    <button
                        type="button"
                        className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
                        onClick={() => alert("TODO: เปลี่ยนสถานะ")}
                    >
                        เริ่มงาน
                    </button>
                }
            />
            <div className="p-8">
                <div className="rounded-xl border p-6 bg-white">รายละเอียดงาน…</div>
            </div>
        </>
    );
}
