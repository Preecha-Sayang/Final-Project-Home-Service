import axios from "axios";

function getBaseURL() {
    const env = process.env.NEXT_PUBLIC_API_BASE;
    if (env && env.trim() !== "") return env; // ใส่ "neon" หรือ "/api"
    return "/api";
}

export const http = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
});

