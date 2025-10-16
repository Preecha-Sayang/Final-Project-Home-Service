import { useRouter } from "next/router";
export default function TechnicianPendingDetail() {
    const { id } = useRouter().query;
    return <div style={{ padding: 24 }}>Technician • Pending Detail — id: {id}</div>;
}