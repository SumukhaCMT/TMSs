import { createContext, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/pages/auth/useAuth";

const RouteModuleContext = createContext<string | null>(null);

interface Props {
  requiredPermission?: string;
  minLevel?: number;
}

export default function ProtectedRoute({ requiredPermission, minLevel = 1 }: Props) {
  const { user, token } = useAuth();
  const parentModule = useContext(RouteModuleContext);

  if (!token || !user) return <Navigate to="/login" replace />;

  if (parentModule && requiredPermission && requiredPermission !== parentModule) {
    console.error(`Misconfigured route: "${requiredPermission}" used inside "${parentModule}" module`);
    return <Navigate to="/dashboard" replace />;
  }

  if (user.user_type === 'super_admin' || user.user_type === 'org_admin') {
    return (
      <RouteModuleContext.Provider value={requiredPermission ?? parentModule}>
        <Outlet />
      </RouteModuleContext.Provider>
    );
  }

  if (requiredPermission) {
    const userLevel = user.permissions?.[requiredPermission] ?? 0;
    if (userLevel < minLevel) return <Navigate to="/dashboard" replace />;
  }

  return (
    <RouteModuleContext.Provider value={requiredPermission ?? parentModule}>
      <Outlet />
    </RouteModuleContext.Provider>
  );
}