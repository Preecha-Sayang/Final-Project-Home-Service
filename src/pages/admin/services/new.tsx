import dynamic from "next/dynamic";
import BackHeader from "@/components/admin/common/BackHeader";
import { useRouter } from "next/router";
// import CategoryForm from "@/components/admin/categories/form";

const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function NewServicePage() {
    const router = useRouter();
    const actions = (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => router.push("/admin/services")}
                className="w-[112px] h-[44px] items-center rounded-lg border border-[var(--blue-600)] bg-white text-base font-medium text-[var(--blue-600)] hover:bg-[var(--gray-100)] cursor-pointer"
            >
                ยกเลิก
            </button>
            <button
                type="submit"
                form="service-form"
                className="w-[112px] h-[44px] rounded-lg bg-[var(--blue-600)] text-base font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
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
            {/* <CategoryForm
                mode="create"
            /> */}
            <ServiceEditor
                mode="create"
            />
        </>
    );
}