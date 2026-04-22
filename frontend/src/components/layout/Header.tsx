import { Button } from "@/components/ui/button"
import {
  Bell, User, Settings,
  LogOut, Key
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MobileSidebar from "./MobileSidebar"
import { NavLink, useNavigate } from "react-router-dom"
// 1. Import the useAuth hook
import { useAuth } from "@/pages/auth/useAuth"

export default function Header() {
  // 2. Get the logout function and user data
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between">
      <MobileSidebar />
      <h2 className="text-xl md:text-2xl font-bold">
        Welcome, {user?.name || "Admin"} 
      </h2>

      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">20</span>
        </Button>

        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Open settings</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="flex w-full items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </NavLink>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <NavLink to="/change-password" className="flex w-full items-center cursor-pointer">
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </NavLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* 3. Connect the logout function */}
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}