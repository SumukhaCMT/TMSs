import { useAuth } from "./auth/useAuth"
import SuperAdminDashboard from "./madules/dashboards/SuperAdminDashboard"
import TempleAdminDashboard from "./madules/dashboards/TempleAdminDashboard"
import UserDashboard from "./madules/dashboards/UserDashboard"
export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

if (user.user_type === "org_admin" || user.user_type === "super_admin") {
    return <SuperAdminDashboard />
}

  if (user.user_type === "temple_admin") {
    return <TempleAdminDashboard templeId={user.temple_id || 0} name={user.name} />
  }
  return <UserDashboard userId={user.id} name={user.name}/>
}