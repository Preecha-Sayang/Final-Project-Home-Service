import axios from "axios";

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "/page/api",
    timeout: 15000,
});

// token ทำไว้รอแล้ว
http.interceptors.request.use((config) => {
    const token = "";
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// (optional)
http.interceptors.response.use(
    (res) => res,
    (err) => {
        const msg =
            err.response?.data?.message ||
            err.message ||
            "Network error";
        return Promise.reject(new Error(msg));
    }
);
