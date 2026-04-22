import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Loader2, Package, ShieldCheck, ChevronRight, ArrowLeft, CheckCircle2, Info
} from "lucide-react"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import api from "@/axios/axios"
import { secureStorage } from "@/utils/secureStorage"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleType = "capacity" | "feature" | "consumable" | "other" | ""
type CapacityType = "users" | "temples" | ""
type ConsumableType = "sms" | "email" | "whatsapp" | ""
type PermLevel = "1" | "2" | "3" | "4" | ""   // view=1 add=2 edit=3 delete=4

interface ModuleForm {
    name: string
    module_type: ModuleType
    custom_module_type: string
    capacity_type: CapacityType
    consumable_type: ConsumableType
    duration_months: string
    credits_per_unit: string
    unit_price: string
}

interface PermissionForm {
    description: string
    org_admin_level: PermLevel
    temple_admin_level: PermLevel
    user_level: PermLevel
}

interface ApiError {
    response?: { data?: { message?: string } }
    message?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toCode(name: string): string {
    return name.trim().toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
}

function encodePermissions(org: PermLevel, temple: PermLevel, user: PermLevel): number {
    const o = org || "0"
    const t = temple || "0"
    const u = user || "0"
    return parseInt(`${o}${t}${u}`, 10)
}

const LEVEL_LABELS: Record<"0" | "1" | "2" | "3" | "4", string> = {
    "0": "No Access",
    "1": "View",
    "2": "Add",
    "3": "Edit",
    "4": "Delete",
}

function levelLabel(val: PermLevel | "0"): string {
    return LEVEL_LABELS[val as "0" | "1" | "2" | "3" | "4"] ?? "—"
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddModule() {
    const navigate = useNavigate()
    const user = secureStorage.getItem("user") as { user_type: string } | null

    useEffect(() => {
        if (user?.user_type !== "super_admin") {
            toast.error("Access denied. Super Admin only.")
            navigate("/dashboard", { replace: true })
        }
    }, [navigate, user?.user_type])

    const [activeTab, setActiveTab] = useState<"module" | "permissions">("module")
    const [moduleComplete, setModuleComplete] = useState(false)

    const [mod, setMod] = useState<ModuleForm>({
        name: "",
        module_type: "",
        custom_module_type: "",
        capacity_type: "",
        consumable_type: "",
        duration_months: "",
        credits_per_unit: "",
        unit_price: "",
    })

    const [perm, setPerm] = useState<PermissionForm>({
        description: "",
        org_admin_level: "",
        temple_admin_level: "",
        user_level: "",
    })

    const [customTypes, setCustomTypes] = useState<string[]>([])
    const [modErrors, setModErrors] = useState<Partial<Record<keyof ModuleForm, string>>>({})
    const [permErrors, setPermErrors] = useState<Partial<Record<keyof PermissionForm | "role", string>>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const moduleCode = toCode(mod.name)
    const effectiveModuleType = mod.module_type === "other" ? mod.custom_module_type : mod.module_type
    const encodedPerm = encodePermissions(perm.org_admin_level, perm.temple_admin_level, perm.user_level)
    const hasAnyPermLevel = perm.org_admin_level || perm.temple_admin_level || perm.user_level

    function validateModule(): boolean {
        const errors: Partial<Record<keyof ModuleForm, string>> = {}
        if (!mod.name.trim()) errors.name = "Module name is required."
        if (!mod.module_type) errors.module_type = "Module type is required."
        if (mod.module_type === "other" && !mod.custom_module_type.trim())
            errors.custom_module_type = "Please enter a custom module type."
        if (!mod.duration_months || isNaN(Number(mod.duration_months)) || Number(mod.duration_months) <= 0)
            errors.duration_months = "Duration is required and must be a positive number."
        if (!mod.unit_price || isNaN(Number(mod.unit_price)) || Number(mod.unit_price) < 0)
            errors.unit_price = "Unit price is required."
        setModErrors(errors)
        return Object.keys(errors).length === 0
    }

    function validatePermission(): boolean {
        const errors: Partial<Record<keyof PermissionForm | "role", string>> = {}
        if (!perm.description.trim()) errors.description = "Description is required."
        if (!perm.org_admin_level && !perm.temple_admin_level && !perm.user_level)
            errors.role = "Set a permission level for at least one role."
        setPermErrors(errors)
        return Object.keys(errors).length === 0
    }

    function handleNextToPermissions() {
        if (!validateModule()) return
        setModuleComplete(true)
        setActiveTab("permissions")
    }

    async function handleSubmit() {
        if (!validateModule() || !validatePermission()) return
        setIsSubmitting(true)
        try {
            const modulePayload = {
                code: moduleCode,
                name: mod.name.trim(),
                module_type: effectiveModuleType,
                capacity_type: mod.capacity_type || null,
                consumable_type: mod.consumable_type || null,
                duration_months: Number(mod.duration_months),
                credits_per_unit: mod.credits_per_unit ? Number(mod.credits_per_unit) : null,
                unit_price: Number(mod.unit_price),
                status: "active",
            }

            const moduleRes = await api.post("/modules", modulePayload)
            const moduleId: number = moduleRes.data?.data?.id ?? moduleRes.data?.id

            if (!moduleId) throw new Error("Module creation failed — no ID returned.")

            if (mod.module_type === "other" && mod.custom_module_type.trim()) {
                setCustomTypes(prev => [...new Set([...prev, mod.custom_module_type.trim()])])
            }

            await api.post("/permissions", {
                module_id: moduleId,
                code: moduleCode,
                name: mod.name.trim(),
                permissions: encodedPerm,
                description: perm.description.trim(),
                is_deprecated: 0,
            })

            toast.success(`Module "${mod.name}" created with permissions.`)
            navigate(-1)
        } catch (err: unknown) {
            const apiErr = err as ApiError
            const msg = apiErr?.response?.data?.message ?? apiErr?.message ?? "Something went wrong."
            toast.error(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    function FieldError({ msg }: { msg?: string }) {
        if (!msg) return null
        return <p className="text-xs text-destructive mt-1">{msg}</p>
    }

    function PermSelect({ label, value, onChange }: {
        label: string
        value: PermLevel
        onChange: (v: PermLevel) => void
    }) {
        return (
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">{label}</Label>
                <Select value={value} onValueChange={v => onChange(v as PermLevel)}>
                    <SelectTrigger>
                        <SelectValue placeholder="No Access" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">View</SelectItem>
                        <SelectItem value="2">Add</SelectItem>
                        <SelectItem value="3">Edit</SelectItem>
                        <SelectItem value="4">Delete</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full pb-12">

            <AppBreadcrumb
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Modules", to: "/modules" },
                    { label: "Add Module" },
                ]}
            />

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-semibold">Create Module</h1>
                    <p className="text-sm text-muted-foreground">
                        Fill in both tabs and submit to create the module and its permission in one step.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-0">
                    <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)}>

                        <TabsList variant="line">
                            <TabsTrigger value="module" className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5" />
                                Module
                                {moduleComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                            </TabsTrigger>
                            <TabsTrigger
                                value="permissions"
                                className="flex items-center gap-1.5"
                                disabled={!moduleComplete}
                            >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Permissions
                            </TabsTrigger>
                        </TabsList>

                        {/* ── MODULE TAB ──────────────────────────────────────── */}
                        <TabsContent value="module">
                            <CardContent className="pt-6 space-y-6">

                                <div className="space-y-1.5">
                                    <Label htmlFor="mod-name">
                                        Module Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="mod-name"
                                        placeholder="e.g. Seva Module"
                                        value={mod.name}
                                        onChange={e => setMod(p => ({ ...p, name: e.target.value }))}
                                    />
                                    {mod.name && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Code auto-generated:&nbsp;
                                            <span className="font-mono font-semibold">{moduleCode}</span>
                                        </p>
                                    )}
                                    <FieldError msg={modErrors.name} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>
                                        Module Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={mod.module_type}
                                        onValueChange={v =>
                                            setMod(p => ({ ...p, module_type: v as ModuleType, custom_module_type: "" }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select module type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="capacity">Capacity</SelectItem>
                                            <SelectItem value="feature">Feature</SelectItem>
                                            <SelectItem value="consumable">Consumable</SelectItem>
                                            {customTypes.map(ct => (
                                                <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                                            ))}
                                            <SelectItem value="other">Other (Custom)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError msg={modErrors.module_type} />
                                </div>

                                {mod.module_type === "other" && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="custom-type">
                                            Custom Type Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="custom-type"
                                            placeholder="Enter custom module type"
                                            value={mod.custom_module_type}
                                            onChange={e =>
                                                setMod(p => ({ ...p, custom_module_type: e.target.value }))
                                            }
                                        />
                                        <FieldError msg={modErrors.custom_module_type} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>
                                            Capacity Type&nbsp;
                                            <span className="text-xs text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Select
                                            value={mod.capacity_type}
                                            onValueChange={v => setMod(p => ({ ...p, capacity_type: v as CapacityType }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="users">Users</SelectItem>
                                                <SelectItem value="temples">Temples</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>
                                            Consumable Type&nbsp;
                                            <span className="text-xs text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Select
                                            value={mod.consumable_type}
                                            onValueChange={v =>
                                                setMod(p => ({ ...p, consumable_type: v as ConsumableType }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sms">SMS</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="duration">
                                            Duration (months) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            min={1}
                                            placeholder="12"
                                            value={mod.duration_months}
                                            onChange={e => setMod(p => ({ ...p, duration_months: e.target.value }))}
                                        />
                                        <FieldError msg={modErrors.duration_months} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="credits">
                                            Credits / Unit&nbsp;
                                            <span className="text-xs text-muted-foreground">(optional)</span>
                                        </Label>
                                        <Input
                                            id="credits"
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 1000"
                                            value={mod.credits_per_unit}
                                            onChange={e => setMod(p => ({ ...p, credits_per_unit: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="price">
                                            Unit Price (₹) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 2000"
                                            value={mod.unit_price}
                                            onChange={e => setMod(p => ({ ...p, unit_price: e.target.value }))}
                                        />
                                        <FieldError msg={modErrors.unit_price} />
                                    </div>
                                </div>

                            </CardContent>

                            <div className="flex justify-end gap-3 border-t px-6 py-4 bg-muted/20">
                                <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                                <Button
                                    onClick={handleNextToPermissions}
                                    className="bg-foreground text-background hover:bg-foreground/90"
                                >
                                    Next: Permissions <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* ── PERMISSIONS TAB ─────────────────────────────────── */}
                        <TabsContent value="permissions">
                            <CardContent className="pt-6 space-y-6">

                                <div className="space-y-1.5">
                                    <Label>Permission Name</Label>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                        <span className="font-medium">{mod.name || "—"}</span>
                                        <Badge variant="secondary" className="ml-auto font-mono text-xs">
                                            {moduleCode}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Auto-synced from module name. The permission code matches the module code.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="perm-desc">
                                        Description <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="perm-desc"
                                        placeholder="Describe what this permission controls..."
                                        rows={3}
                                        value={perm.description}
                                        onChange={e => setPerm(p => ({ ...p, description: e.target.value }))}
                                    />
                                    <FieldError msg={permErrors.description} />
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium mb-1">Access Levels per Role</p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Select the maximum action each role can perform. Stored as a 3-digit
                                        code — <span className="font-mono">[ Org · Temple · User ]</span>
                                    </p>

                                    <div className="grid grid-cols-3 gap-4">
                                        <PermSelect
                                            label="Organization Admin"
                                            value={perm.org_admin_level}
                                            onChange={v => setPerm(p => ({ ...p, org_admin_level: v }))}
                                        />
                                        <PermSelect
                                            label="Temple Admin"
                                            value={perm.temple_admin_level}
                                            onChange={v => setPerm(p => ({ ...p, temple_admin_level: v }))}
                                        />
                                        <PermSelect
                                            label="User"
                                            value={perm.user_level}
                                            onChange={v => setPerm(p => ({ ...p, user_level: v }))}
                                        />
                                    </div>
                                    <FieldError msg={permErrors.role} />
                                </div>

                                {hasAnyPermLevel && (
                                    <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm space-y-2">
                                        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                                            Encoded Preview
                                        </p>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Org Admin</p>
                                                <p className="font-semibold">
                                                    {levelLabel(perm.org_admin_level || "0")}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Temple Admin</p>
                                                <p className="font-semibold">
                                                    {levelLabel(perm.temple_admin_level || "0")}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">User</p>
                                                <p className="font-semibold">
                                                    {levelLabel(perm.user_level || "0")}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <p className="text-xs text-muted-foreground">Stored as</p>
                                                <p className="font-mono text-2xl font-bold tracking-widest">
                                                    {encodedPerm}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </CardContent>

                            <div className="flex justify-between gap-3 border-t px-6 py-4 bg-muted/20">
                                <Button variant="outline" onClick={() => setActiveTab("module")}>
                                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                                </Button>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="min-w-36 bg-foreground text-background hover:bg-foreground/90"
                                    >
                                        {isSubmitting
                                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                                            : <><CheckCircle2 className="mr-2 h-4 w-4" />Create Module</>
                                        }
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                    </Tabs>
                </CardHeader>
            </Card>
        </div>
    )
}