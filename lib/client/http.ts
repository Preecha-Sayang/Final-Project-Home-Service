import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

function getBaseURL(): string {
    const env = process.env.NEXT_PUBLIC_API_BASE;
    if (env && env.trim() !== "") return env; // เช่น "localhost" หรือ "/api"
    return "/api";
}

const TOKEN_KEYS = [
    "admin_jwt",
    "jwt_admin",
    "access_token",
    "token"
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

    // 2) cookie
    try {
        const all = document.cookie;
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

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
        config.headers = config.headers ?? {};
        if (!("Authorization" in config.headers)) {
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }
    return config;
});
