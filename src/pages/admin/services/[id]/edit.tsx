import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import AdminShell from "@/pages/admin/index";
import BackHeader from "@/components/admin/common/BackHeader";

const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function EditServicePage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : undefined;
    if (!id) return null;

    const triggerSave = () => window.dispatchEvent(new CustomEvent("service-editor:save"));

    const actions = (
        <div>
            <button onClick={() => router.push("/admin/services")} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 hover:bg-gray-50">
                ยกเลิก
            </button>
            <button onClick={triggerSave} className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700">
                บันทึก
            </button>
        </div>
    );

    return (
        <>
            <BackHeader
                subtitle="บริการ"
                title="แก้ไขบริการ"
                backHref="/admin/services"
                actions={actions}
            />
            <ServiceEditor mode="edit" id={id} />
        </>
    );
}