import { useAuth } from "@/context/AuthContext"; // ปรับ path ตามจริง
import axios, { AxiosRequestConfig } from "axios";

type FetchWithTokenType = <T = unknown>(
  url: string,
  options?: AxiosRequestConfig
) => Promise<T>;

export function useFetchWithToken(): FetchWithTokenType {
  const { accessToken, refreshToken, login, logout } = useAuth();

  const fetchWithToken: FetchWithTokenType = async <T = unknown>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    if (!accessToken) throw new Error("No access token, please login");

    const doFetch = (token: string) =>
      axios.request<T>({
        url,
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

    try {
      const res = await doFetch(accessToken);
      return res.data;
    } catch (error: any) {
      const isUnauthorized = error.response?.status === 401;

      if (!isUnauthorized) {
        throw new Error(error.response?.data?.message || "Request failed");
      }

      if (!refreshToken) {
        logout();
        throw new Error("No refresh token, please login again");
      }

      try {
        const refreshRes = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data;

        // fallback ถ้าไม่ได้ refreshToken ใหม่
        login(newAccessToken, newRefreshToken ?? refreshToken);

        // ลองยิงใหม่
        const retryRes = await doFetch(newAccessToken);
        return retryRes.data;
      } catch (refreshError: any) {
        logout();
        throw new Error(
          refreshError.response?.data?.message || "Refresh token expired, please login again"
        );
      }
    }
  };

  return fetchWithToken;
}