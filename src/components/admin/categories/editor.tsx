import { useState } from "react";
import { useRouter } from "next/router";
import InputField from "@/components/input/inputField/input_state";

type Props = {
    mode: "create" | "edit";
    id?: string; 
};

export default function CategoryEditor({mode, id}: Props) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    async function handleSubmit() {
        if (!name.trim()) {
            alert("กรุณากรอกชื่อหมวดหมู่");
            return;
        }

        setSaving(true);
        try {
            if (mode === "create") {
                // Todo: ต้องทำ api สร้าง
                console.log("สร้างหมวดหมู่:", id, name)
            } else {
                // Todo: ต้องทำ api แก้ไข
                console.log("แก้ไขหมวดหมู่:", id, name)
            }
            router.push("/admin/categories")
        } finally {
            setSaving(false);
        }
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        void handleSubmit();
    }

    return (
        <form
            onSubmit={onSubmit}
            className="rounded-2xl border border--[var(--gray-200)] bg-white p-6">
                <div className="grid gap-6">
                    <InputField
                    label="ชื่อหมวดหมู่"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    validate={(v) => (v.trim() ? null : "กรุณากรอกชื่อหมวดหมู๋")}
                     />
                </div>
        </form>
    )
}