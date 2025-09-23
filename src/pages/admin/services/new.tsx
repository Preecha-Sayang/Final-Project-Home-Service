import dynamic from "next/dynamic";
const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function NewServicePage() {
    return <ServiceEditor mode="create" />; //แบบกดเพิ่มบริการ
}
