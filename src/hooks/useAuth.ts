import { useAuth } from "@/context/AuthContext";
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
    } catch (error: unknown) {
      // ✅ ใช้ AxiosError
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        // ❗  ถ้าไม่ใช่ 401 -> โยน error ออกไป
        if (status !== 401) {
          throw new Error(
            error.response?.data?.message || "Request failed"
          );
        }
      } else {
        throw new Error("Unexpected error occurred");
      }

      // 🚨 ถ้าไม่มี refreshToken -> logout
      if (!refreshToken) {
        logout();
        throw new Error("No refresh token, please login again");
      }

      try {
        // 🔁 Try Refresh
        const refreshRes = await axios.post("/api/auth/refresh", {
          refreshToken,
        });

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        } = refreshRes.data;

        login(newAccessToken, newRefreshToken ?? refreshToken);

        // 🔁 Retry Original Request
        const retryRes = await doFetch(newAccessToken);
        return retryRes.data;
      } catch (refreshError: unknown) {
        logout();
        if (axios.isAxiosError(refreshError)) {
          throw new Error(
            refreshError.response?.data?.message ||
              "Refresh expired, please login again"
          );
        }
        throw new Error("Token refresh failed, please login again");
      }
    }
  };

  return fetchWithToken;
}
