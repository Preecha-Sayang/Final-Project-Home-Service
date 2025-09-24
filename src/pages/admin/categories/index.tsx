import AdminShell from "@/pages/admin/index";
import BackHeader from "@/components/admin/common/BackHeader";

export default function AdminCategoriesPage() {
    return (
        <>
            <BackHeader title="หมวดหมู่" subtitle="จัดการ" backHref="/admin/categories" />
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,.06)]">
                กำลังพัฒนา…
            </div>
        </>
    );
}