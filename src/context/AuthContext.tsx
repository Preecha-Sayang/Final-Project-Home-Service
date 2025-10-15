import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

// Define the expected JWT payload structure
interface JwtPayload {
  exp: number;
  // Add other JWT fields you expect here
  // iat?: number;
  // userId?: string;
  // etc.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  const login = (newAccessToken: string, newRefreshToken: string) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  };

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const res = await axios.post("/api/auth/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

      login(newAccessToken, newRefreshToken ?? refreshToken);
      console.log("✅ Access token refreshed");
    } catch (err) {
      console.error("❌ Failed to refresh token", err);
      logout();
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);
      const exp = decoded.exp * 1000;
      const now = Date.now();

      const timeout = exp - now - 10_000;

      if (timeout <= 0) {
        refreshAccessToken();
      } else {
        const timer = setTimeout(() => {
          refreshAccessToken();
        }, timeout);

        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }, [accessToken, refreshToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!accessToken, accessToken, refreshToken, login, logout }}
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