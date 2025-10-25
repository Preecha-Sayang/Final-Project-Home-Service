import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-hot-toast";

interface User {
  user_id: number;
  name: string;
}

interface JwtPayload {
  userId: number;
  email?: string;
  exp: number;
}

type AuthContextType = {
  user?: User;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // โหลด token จาก localStorage ตอน mount
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (storedAccess) {
      setAccessToken(storedAccess);
      try {
        const decoded = jwtDecode<JwtPayload>(storedAccess);
        setUser({ user_id: decoded.userId, name: decoded.email ?? "" });
      } catch (err) {
        console.error("Invalid access token:", err);
      }
    }

    if (storedRefresh) setRefreshToken(storedRefresh);

    setLoading(false);
  }, []);

  // login function
  const login = useCallback((newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    try {
      const decoded = jwtDecode<JwtPayload>(newAccessToken);
      setUser({ user_id: decoded.userId, name: decoded.email ?? "" });
    } catch (err) {
      console.error("Invalid token on login:", err);
    }
  }, []);

  // logout function
  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(undefined);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    toast.success("ออกจากระบบเรียบร้อยแล้ว", {
      style: { background: "#1e40af", color: "#fff", fontWeight: "bold" },
    });

    setTimeout(() => setIsLoggingOut(false), 1000);
  }, []);

  // refreshAccessToken function
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;

    try {
      const res = await axios.post("/api/auth/refresh", { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken ?? refreshToken);
      localStorage.setItem("accessToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken ?? refreshToken);

      try {
        const decoded = jwtDecode<JwtPayload>(newAccessToken);
        setUser({ user_id: decoded.userId, name: decoded.email ?? "" });
      } catch {}

      console.log("✅ Access token refreshed");
    } catch (err) {
      console.error("❌ Failed to refresh token", err);
      logout();
    }
  }, [refreshToken, logout]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const timeout = exp - now - 10_000; // Refresh 10s before expiry

      if (timeout <= 0) {
        refreshAccessToken();
      } else {
        const timer = setTimeout(() => refreshAccessToken(), timeout);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, [accessToken, refreshToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!accessToken,
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};