import dynamic from "next/dynamic";
import BackHeader from "@/components/admin/common/BackHeader";

const CategoryEditor = dynamic(() => import("@/components/admin/categories/editor"), { ssr: false });

export default function NewCategoryPage() {
    const actions = (
        <div className="flex gap-2">
            <a href="/admin/categories" className="h-9 inline-flex items-center rounded-lg border border-[var(--gray-200)] bg-white px-3 text-sm text-[var(--gray-800)] hover:bg-[var(--gray-100)] cursor-pointer">
                ยกเลิก
            </a>
            <button
                type="submit"
                form="service-form"
                className="h-9 rounded-lg bg-[var(--blue-600)] px-3 text-sm font-medium text-white hover:bg-[var(--blue-700)] cursor-pointer"
            >
                สร้าง
            </button> 
        </div>
    );

    return (
        <>
            <BackHeader
                subtitle=""
                title="เพิ่มหมวดหมู่"
                backHref="/admin/categories"
                actions={actions}
            />
            <CategoryEditor
                mode="create"
            />
        </>
    );
}