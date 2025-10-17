import { useRouter } from "next/router";
export default function TechnicianHistoryDetail() {
    const { id } = useRouter().query;
    return <div style={{ padding: 24 }}>Technician • History Detail — id: {id}</div>;
}