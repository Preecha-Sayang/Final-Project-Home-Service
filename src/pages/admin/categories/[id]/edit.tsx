import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import BackHeader from "@/components/admin/common/BackHeader";

const CategoryEditor = dynamic(() => import("@/components/admin/categories/editor"), { ssr: false });

export default function EditCategoryPage() {
    const router = useRouter();
    const id = typeof router.query.id === "string" ? router.query.id : undefined;
    if (!id) return null;

    const triggerSave = () => window.dispatchEvent(new CustomEvent("service-editor:save"));

    const actions = (
        <div>
            <button onClick={() => router.push("/admin/categories")} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 hover:bg-gray-50">
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
                subtitle="หมวดหมู่"
                title="แก้ไขหมวดหมู่"
                backHref="/admin/categpries"
                actions={actions}
            />
            <CategoryEditor mode="edit" id={id} />

        </>
    );
}