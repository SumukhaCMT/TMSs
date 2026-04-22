import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import DataTable from "@/components/common/DataTable"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react"
import api from "@/axios/axios"
import { toast } from "sonner"
import { secureStorage } from "@/utils/secureStorage"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Module {
    id: number
    code: string
    name: string
    module_type: string
    capacity_type: string | null
    consumable_type: string | null
    duration_months: number
    credits_per_unit: number | null
    unit_price: number
    status: "active" | "inactive"
    created_at: string
}

interface Permission {
    id: number
    module_id: number
    code: string
    name: string
    permissions: number
    description: string
}

// key must be keyof Module — for non-data columns (actions etc.) use a real key
// that exists on Module. The render fn overrides what actually displays.
interface TableColumn {
    key: keyof Module
    label: string             // ← correct
    render: (row: Module) => React.ReactNode
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function decodePermissions(encoded: number): { org: string; temple: string; user: string } {
    const str = String(encoded).padStart(3, "0")
    const map: Record<string, string> = {
        "0": "—", "1": "View", "2": "Add", "3": "Edit", "4": "Delete",
    }
    return { org: map[str[0]], temple: map[str[1]], user: map[str[2]] }
}

function moduleTypeBadge(type: string) {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
        feature: "default",
        capacity: "secondary",
        consumable: "outline",
    }
    return (
        <Badge variant={variants[type] ?? "outline"} className="capitalize">
            {type}
        </Badge>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ModulesTable() {
    const navigate = useNavigate()
    const user = secureStorage.getItem("user") as { user_type: string } | null

    const [modules, setModules] = useState<Module[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<Module | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [viewPerm, setViewPerm] = useState<Permission | null>(null)

    // ── Fetch ─────────────────────────────────────────────────────────────────
    async function fetchData() {
        setIsLoading(true)
        try {
            const [modRes, permRes] = await Promise.all([
                api.get("/v1/modules"),
                api.get("/v1/permissions"),
            ])
            setModules(modRes.data?.data ?? modRes.data ?? [])
            setPermissions(permRes.data?.data ?? permRes.data ?? [])
        } catch {
            toast.error("Failed to load modules.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    // ── Delete ────────────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await api.delete(`/v1/modules/${deleteTarget.id}`)
            toast.success(`Module "${deleteTarget.name}" deleted.`)
            setDeleteTarget(null)
            fetchData()
        } catch {
            toast.error("Failed to delete module.")
        } finally {
            setIsDeleting(false)
        }
    }

    // ── Columns ───────────────────────────────────────────────────────────────
    // All keys must be keyof Module. For "virtual" columns (actions, permissions)
    // we reuse an existing key — render() fully overrides what is displayed.
    const columns = useMemo<TableColumn[]>(() => [
        {
            key: "name",                          // real Module key
            label: "Module",
            render: (row) => (
                <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{row.code}</p>
                </div>
            ),
        },
        {
            key: "module_type",                   // real Module key
            label: "Type",
            render: (row) => moduleTypeBadge(row.module_type),
        },
        {
            key: "unit_price",                    // real Module key
            label: "Price",
            render: (row) => (
                <span className="font-semibold">₹{Number(row.unit_price).toLocaleString("en-IN")}</span>
            ),
        },
        {
            key: "duration_months",              // real Module key
            label: "Duration",
            render: (row) => <span>{row.duration_months} mo</span>,
        },
        {
            key: "status",                        // real Module key — reused for permission display
            label: "Permissions",
            render: (row) => {
                const linked = permissions.find(p => p.module_id === row.id)
                if (!linked) return <span className="text-xs text-muted-foreground">—</span>
                const decoded = decodePermissions(linked.permissions)
                return (
                    <button
                        onClick={() => setViewPerm(linked)}
                        className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                    >
                        {decoded.org} · {decoded.temple} · {decoded.user}
                    </button>
                )
            },
        },
        {
            key: "created_at",                   // real Module key — reused for status display
            label: "Status",
            render: (row) => (
                <Badge variant={row.status === "active" ? "default" : "secondary"} className="capitalize">
                    {row.status}
                </Badge>
            ),
        },
        {
            key: "id",                           // real Module key — reused for actions
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => navigate(`/modules/${row.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(row)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], [permissions, navigate])

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6">

            <AppBreadcrumb
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Modules" },
                ]}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold flex items-center gap-2">
                        <Package className="h-5 w-5" /> Modules
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage system modules and their permissions.
                    </p>
                </div>
                {user?.user_type === "super_admin" && (
                    
                    <Button
                        onClick={() => navigate("/modules/add")}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Module
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64 border rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <DataTable<Module>
                    data={modules}
                    columns={columns}
                    storageKey="modules_v1_table"

                />
            )}

            {/* ── Permission detail dialog ─────────────────────────────────────── */}
            <Dialog open={!!viewPerm} onOpenChange={() => setViewPerm(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Permission — {viewPerm?.name}</DialogTitle>
                        <DialogDescription className="font-mono text-xs">{viewPerm?.code}</DialogDescription>
                    </DialogHeader>
                    {viewPerm && (() => {
                        const d = decodePermissions(viewPerm.permissions)
                        return (
                            <div className="space-y-3 text-sm">
                                <p className="text-muted-foreground">{viewPerm.description}</p>
                                <div className="rounded-md border divide-y">
                                    <div className="flex justify-between px-3 py-2">
                                        <span className="text-muted-foreground">Organization Admin</span>
                                        <span className="font-medium">{d.org}</span>
                                    </div>
                                    <div className="flex justify-between px-3 py-2">
                                        <span className="text-muted-foreground">Temple Admin</span>
                                        <span className="font-medium">{d.temple}</span>
                                    </div>
                                    <div className="flex justify-between px-3 py-2">
                                        <span className="text-muted-foreground">User</span>
                                        <span className="font-medium">{d.user}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground border rounded-md px-3 py-2">
                                    <span>Encoded value</span>
                                    <span className="font-mono font-bold">{viewPerm.permissions}</span>
                                </div>
                            </div>
                        )
                    })()}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewPerm(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete confirm dialog ────────────────────────────────────────── */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Module</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
                            Its linked permission will also be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                                : "Delete"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}