import dynamic from "next/dynamic";

import AdminShell from "@/pages/admin/index";
import BackHeader from "@/components/admin/common/BackHeader";

const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function NewServicePage() {
    const triggerSave = () => window.dispatchEvent(new CustomEvent("service-editor:save"));
    const actions = (
        <>
            <a
                href="/admin/services"
                className="h-9 inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 hover:bg-gray-50"
            >
                ยกเลิก
            </a>
            <button
                onClick={triggerSave}
                className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
            >
                สร้าง
            </button>
        </>
    );

    return (
        <AdminShell>
            <BackHeader subtitle="บริการ" title="เพิ่มบริการ" backHref="/admin/services" actions={actions} />
            <ServiceEditor mode="create" />
        </AdminShell>
    );
}