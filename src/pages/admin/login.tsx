// src/pages/admin/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/client/api";     // axios instance (baseURL: "/api")
import nookies from "nookies";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // เรียก API: POST /api/admin/login
            const { data } = await api.post("/admin/login", { email, password });

            // เก็บ token ลง cookie (ฝั่ง client) — ถ้าจะให้ปลอดภัยกว่า ให้ set HttpOnly ที่ API ฝั่ง server แทน
            nookies.set(null, "admin_token", data.token, {
                path: "/",
                httpOnly: false, // ถ้าต้องการ HttpOnly ให้ย้ายไป set ใน API
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 30, // 30 นาที
            });

            // ไปหน้าแอดมิน
            router.push("/admin/services");
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-sm p-6">
            <h1 className="mb-4 text-lg font-semibold">Admin Login</h1>

            <form onSubmit={handleSubmit} className="grid gap-3">
                <input
                    className="rounded border px-3 py-2"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="rounded border px-3 py-2"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </button>
            </form>
        </div>
    );
}
