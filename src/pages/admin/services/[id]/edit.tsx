import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const ServiceEditor = dynamic(() => import("@/components/admin/services/editor"), { ssr: false });

export default function EditServicePage() {
    const { query } = useRouter();
    const id = typeof query.id === "string" ? query.id : undefined;
    if (!id) return null;
    return <ServiceEditor mode="edit" id={id} />; //แบบกดแก้ไข
}
