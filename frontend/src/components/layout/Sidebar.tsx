


import { NavLink } from "react-router-dom"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Building2,
  HandCoins,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* ---------------- MENU CONFIG ---------------- */
const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Organizations",
    icon: Building2,
    children: [
      { label: "All Organizations", path: "/organizations" },
      { label: "Add Organization trustees", path: "/organizations/trustees" },
          { label: "All Temple", path: "/temples" },
    ],
  },
   {
    label: "Seva Management",
    path: "/sevas",
    icon: Users,
  },
  // {
  //   label: "Donations",
  //   path: "/donations",
  //   icon: HandCoins,
  // },
  {
    label: "Deities Management",
    path: "/deities",
    icon: Users,
  },
 
  {
    label: "Devotees Management",
    path: "/devotees",
    icon: Users,
  },
  {
    label: "Payment Methods",
    path: "/payment-methods",
    icon: Users,
  },
  {
    label: "Seva Booking",
    path: "/seva-booking",
    icon: HandCoins,
  },
    {
    label: "Hundi Management",
    path: "/hundi",
    icon: HandCoins,
  },
  {
    label:"Tokens Managements",
    path: "/tokens",
    icon: Users,
  }
]

/* ---------------- COMPONENT ---------------- */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "h-screen border-r bg-background transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && <h2 className="text-lg font-bold">TMS Saas</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const hasChildren = !!item.children

            /* -------- MAIN ITEM -------- */
            const mainItem = hasChildren ? (
              <button
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-muted",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus[item.label] && "rotate-180"
                      )}
                    />
                  </>
                )}
              </button>
            ) : (
              <NavLink
                to={item.path!}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-muted font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )

            return (
              <div key={item.label}>
                {/* Tooltip only when collapsed */}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{mainItem}</TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  mainItem
                )}

                {/* -------- SUBMENU -------- */}
                {!collapsed && hasChildren && openMenus[item.label] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            "block rounded-md px-3 py-2 text-sm",
                            isActive
                              ? "bg-muted font-medium text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
