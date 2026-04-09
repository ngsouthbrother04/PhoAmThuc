import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authAPI } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  const register = useCallback(async (email, password, fullName) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authAPI.register(email, password, fullName);
      if (data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem("refreshToken", data.refreshToken);
        return { success: true, data };
      } else {
        setError(data.message || "Registration failed");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Registration error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authAPI.login(email, password);
      if (data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem("refreshToken", data.refreshToken);
        return { success: true, data };
      } else {
        setError(data.message || "Login failed");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Login error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
      setToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
