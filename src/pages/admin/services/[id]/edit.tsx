import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import BackHeader from "@/components/admin/common/BackHeader";

const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function EditServicePage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : undefined;
    if (!id) return null;

    const actions = (
        <div className="flex gap-2">
            <button
                onClick={() => router.push("/admin/services")}
                className="h-9 rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer"
            >
                ยกเลิก
            </button>
            <button
                type="submit"
                form="service-form"
                className="h-9 rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
            >
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
            <ServiceEditor
                mode="edit"
                id={id}
            />
        </>
    );
}