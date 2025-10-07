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
      if (error.response?.status !== 401) {
        throw new Error(error.response?.data?.message || "Request failed");
      }

      // ถ้า 401 - พยายาม refresh token
      if (!refreshToken) {
        logout();
        throw new Error("No refresh token, please login again");
      }

      try {
        const refreshRes = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshRes.data;

        login(newAccessToken, newRefreshToken ?? refreshToken);

        const retryRes = await doFetch(newAccessToken);
        return retryRes.data;
      } catch (refreshError) {
        logout();
        throw new Error("Refresh token expired, please login again");
      }
    }
  };

  return fetchWithToken;
}