import { useAuth } from "@/context/AuthContext"; // ปรับ path ตามจริง

type FetchWithTokenType = <T = unknown>(
  url: string,
  options?: RequestInit
) => Promise<T>;

export function useFetchWithToken(): FetchWithTokenType {
  const { accessToken, refreshToken, login, logout } = useAuth();

  const fetchWithToken: FetchWithTokenType = async (url, options = {}) => {
    if (!accessToken) throw new Error("No access token, please login");

    const doFetch = async (token: string) =>
      fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });

    let res = await doFetch(accessToken);

    if (res.status === 401) {
      if (!refreshToken) {
        logout();
        throw new Error("No refresh token, please login again");
      }

      const refreshRes = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        logout();
        throw new Error("Refresh token expired, please login again");
      }

      const data = await refreshRes.json();
      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken ?? refreshToken;

      login(newAccessToken, newRefreshToken);

      res = await doFetch(newAccessToken);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Request failed");
    }

    return res.json();
  };

  return fetchWithToken;
}