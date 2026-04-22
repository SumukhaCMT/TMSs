import { NavLink } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Building2,
  HandCoins,
  CalendarCheck,
  Users,
  Settings,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Organizations", path: "/organizations", icon: Building2 },
  { label: "Donations", path: "/donations", icon: HandCoins },
  { label: "Bookings", path: "/bookings", icon: CalendarCheck },
  { label: "Users", path: "/users", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings },
]

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <div className="border-b p-4 text-lg font-bold">
          My SaaS
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-muted font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
