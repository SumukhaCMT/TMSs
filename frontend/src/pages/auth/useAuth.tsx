import { createContext, useContext, useState, useEffect, useCallback,useRef } from "react";
import type { ReactNode } from "react";
import { secureStorage } from "@/utils/secureStorage";
import { useNavigate } from "react-router-dom";
import api from "@/axios/axios";

export interface User {
  id: number;
  userid?: number;
  name: string;
  email: string;
  phone?: string;
  user_code?: string;
  user_type: string;
  role?: string;
  org_id?: number;
  organization_id?: number;
  temple_id?: number;
  
  Role?: string;
  role_id?: number;
  number_of_users?: number;
  org_ids?: number[];
  number_of_organisations?: number;
   temple?: {
    id: number;
    name: string;
    lat: number;
    lng: number;
  };
  permissions: Record<string, number>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const storedToken = secureStorage.getItem("token");
// if (storedToken) {
//   api.defaults.headers.Authorization = `Bearer ${storedToken}`;
// }

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => secureStorage.getItem("user"));
  const [token, setToken] = useState<string | null>(() => secureStorage.getItem("token"));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // =========================================================
  // ✅ FETCH TEMPLE DATA
  // =========================================================
  const fetchTemple = async (token: string) => {
    try {
      const res = await api.get("/v1/temple/temples", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const temple =
        res.data.data.find((t: any) => t.is_primary === 1) ||
        res.data.data[0];

      return temple || null;
    } catch (err) {
      console.error("Temple fetch failed", err);
      return null;
    }
  };

const logout = useCallback(async () => {
  if (timerRef.current) clearTimeout(timerRef.current);
  try {
    if (token) {
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch {
    // Silent fail to ensure local cleanup
  } finally {
    setUser(null);
    setToken(null);
    secureStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  }
}, [navigate, token]);

const startTimer = useCallback(() => {
  if (timerRef.current) clearTimeout(timerRef.current);
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const totalDurationMs = (payload.exp - payload.iat) * 1000;
    timerRef.current = setTimeout(logout, totalDurationMs);

  } catch {
    logout();
  }
}, [logout, token]);

useEffect(() => {
  if (!token) return;
  const handleActivity = () => startTimer();

  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  activityEvents.forEach(event => 
    window.addEventListener(event, handleActivity)
  );

  // Initial start
  startTimer();

  return () => {
    activityEvents.forEach(event => 
      window.removeEventListener(event, handleActivity)
    );
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, [token, startTimer]);

useEffect(() => {
    if (token) startTimer();
  if (user && import.meta.env.VITE_STORAGE_KEY) {
    console.group("info:");
    console.log("User:", user.name);
    console.log("Role:", user.user_type);
    console.log("Permissions:", user.permissions);
    console.log("Temple ID:", user.temple_id);
    console.log("Organization ID:", user.organization_id);
    console.log("Token:", token);
    console.log("Refresh Token:", secureStorage.getItem("refresh_token"));
    console.groupEnd();
  }

  const respInterceptor = api.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err.response?.status === 401 && !err.config.url?.includes('/logout')) {
        await logout();
      }
      return Promise.reject(err);
    }
  );

  return () => {
    api.interceptors.response.eject(respInterceptor);
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, [token, user, logout, startTimer]);

  // const login = (userData: User, newToken: string, newRefreshToken: string) => {
  //   setUser(userData);
  //   setToken(newToken);
  //   secureStorage.setItem("user", userData);
  //   secureStorage.setItem("token", newToken);
  //   secureStorage.setItem("refresh_token", newRefreshToken);
  //   startTimer();
  // };
  const login = async (userData: User, newToken: string, newRefreshToken: string) => {
  let updatedUser = { ...userData };

  // ✅ attach temple (THIS IS THE FIX)
  try {
    const temple = await fetchTemple(newToken);

    if (temple) {
      updatedUser = {
        ...updatedUser,
        temple_id: temple.id,
        temple: {
          id: temple.id,
          name: temple.name,
          lat: Number(temple.lat),
          lng: Number(temple.lng),
        },
      };
    }
  } catch (err) {
    console.error("Temple attach failed", err);
  }

  // ✅ keep your original logic
  setUser(updatedUser);
  setToken(newToken);

  secureStorage.setItem("user", updatedUser);
  secureStorage.setItem("token", newToken);
  secureStorage.setItem("refresh_token", newRefreshToken);

  startTimer();
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}