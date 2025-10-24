import { useAuth } from "@/context/AuthContext";
import axios, { AxiosRequestConfig } from "axios";
import { useCallback } from "react";

type FetchWithTokenType = <T = unknown>(
  url: string,
  options?: AxiosRequestConfig
) => Promise<T>;

export function useFetchWithToken(): FetchWithTokenType {
  const { accessToken, refreshToken, login, logout } = useAuth();

  // ✅ ใช้ useCallback เพื่อ memoize function แต่ต้องใส่ dependencies ที่ stable
  const fetchWithToken = useCallback(
    async <T = unknown>(
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
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

      try {
        const res = await doFetch(accessToken);
        return res.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status !== 401) {
            throw new Error(error.response?.data?.message || "Request failed");
          }
        } else {
          throw new Error("Unexpected error occurred");
        }

        if (!refreshToken) {
          logout();
          throw new Error("No refresh token, please login again");
        }

        try {
          const refreshRes = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            refreshRes.data;

          login(newAccessToken, newRefreshToken ?? refreshToken);

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
    },
    [accessToken, refreshToken, login, logout] // ✅ เพิ่ม dependencies
  );

  return fetchWithToken;
}