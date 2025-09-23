import axios from "axios";
export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
