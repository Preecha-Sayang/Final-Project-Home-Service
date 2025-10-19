import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/** baseURL สำหรับเรียก API (ใช้ /api ของ Next เป็นดีฟอลต์) */
function getBaseURL(): string {
    const env = process.env.NEXT_PUBLIC_API_BASE;
    if (env && env.trim() !== "") return env; // เช่น "http://localhost:4000" หรือ "/api"
    return "/api";
}

/** รายชื่อ key ที่จะลองดึงโทเค็นจากฝั่ง client (กันเคสหลายทีมตั้งชื่อไม่เหมือนกัน) */
const TOKEN_KEYS = [
    "admin_jwt",       // ที่เราใช้กันในโปรเจกต์
    "jwt_admin",       // กันเคสใครใช้ชื่อนี้
    "access_token",    // กันเคสใช้ generic
    "token"            // กันเคสสั้นๆ
];

function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // 1) localStorage
    try {
        for (const k of TOKEN_KEYS) {
            const v = window.localStorage.getItem(k);
            if (v && v.trim() !== "") return v.trim();
        }
    } catch { }

    // 2) cookie (อ่านแค่ชื่อที่เรารู้จัก)
    try {
        const all = document.cookie; // "k1=v1; k2=v2"
        for (const k of TOKEN_KEYS) {
            const m = all.match(new RegExp(`(?:^|;\\s*)${k}=([^;]+)`));
            if (m && m[1]) return decodeURIComponent(m[1]);
        }
    } catch { }

    return null;
}

export const http: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    withCredentials: true,
});

/** แทรก Authorization header อัตโนมัติถ้ามีโทเค็น */
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
        // สร้าง headers ถ้ายังไม่มี
        config.headers = config.headers ?? {};
        // ถ้ายังไม่มี Authorization ค่อยเติม (จะไม่ไปทับของเดิม)
        if (!("Authorization" in config.headers)) {
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});
