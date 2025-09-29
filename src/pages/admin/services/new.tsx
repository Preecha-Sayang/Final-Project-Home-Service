import dynamic from "next/dynamic";
import BackHeader from "@/components/admin/common/BackHeader";
import { Link } from "lucide-react";

const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function NewServicePage() {
    const actions = (
        <div className="flex gap-2">
            <Link to="/admin/services" className="h-9 inline-flex items-center rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer">
                ยกเลิก
            </Link>
            <button
                type="submit"
                form="service-form"
                className="h-9 rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
            >
                สร้าง
            </button> {/*ทำแจ้งเตือน popup*/}
        </div>
    );

    return (
        <>
            <BackHeader
                subtitle="บริการ"
                title="เพิ่มบริการ"
                backHref="/admin/services"
                actions={actions}
            />
            <ServiceEditor
                mode="create"
            />
        </>
    );
}