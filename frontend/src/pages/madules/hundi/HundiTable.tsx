import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import DataTable from "@/components/common/DataTable"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Coins, Gem, ImageIcon, Calendar, FileText, Box, Plus, X } from "lucide-react"
import api from "@/axios/axios"
import { toast } from "sonner"
import { secureStorage } from "@/utils/secureStorage"

interface HundiWitness { name: string; designation?: string; phone?: string; }
interface HundiDenomination { denomination_value: number; quantity: number; subtotal: number; }
interface HundiItem { item_name: string; quantity: number; estimated_value?: number; description?: string; unit?: string; }

interface Hundi {
  id: number;
  sl_no?: number;
  temple_id: number;
  deity_id: number | null;
  deity_ids?: string;
  opened_at: string;
  total_amount: number;
  total_items_value: number;
  remark?: string;
  witnesses?: HundiWitness[];
  denominations?: HundiDenomination[];
  items?: HundiItem[];
  hundi_img_name?: string;
  hundi_witness_signature?: string;
  _temple_name?: string;
  _deity_name?: string;
}

interface LookupItem { id: number; name: string; temple_id?: number; }
interface DefinedHundi { id: number; hundi_name: string; hundi_number: string; deity_id: number; temple_id: number; }

interface TableColumn {
  key: string;
  label: React.ReactNode;
  render: (row: Hundi) => React.ReactNode;
}

const STATIC_IMAGE_URL = "http://localhost:5000/public/hundi/";

export default function HundiTable() {
  const navigate = useNavigate()
  const user = secureStorage.getItem("user") as { user_type: string; organization_id: number; temple_id: number | null } | null

  const [data, setData] = useState<Hundi[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [templeMap, setTempleMap] = useState<Record<string, string>>({})
  const [deitiesList, setDeitiesList] = useState<LookupItem[]>([])

  const [definedHundis, setDefinedHundis] = useState<DefinedHundi[]>([])

  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewData, setViewData] = useState<Hundi | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id?: number; type: 'single' | 'bulk' } | null>(null)

  const isOrgAdmin = user?.user_type === "org_admin" || user?.user_type === "super_admin"
  const [isDefineOpen, setIsDefineOpen] = useState(false)
  const [defineData, setDefineData] = useState({
    temple_id: user?.temple_id ? String(user.temple_id) : "",
    deity_id: "",
    hundi_name: "",
    hundi_number: ""
  })
  const [isSubmittingDefine, setIsSubmittingDefine] = useState(false)

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const cleanStr = dateStr.replace(" ", "T");
      return format(parseISO(cleanStr), "dd MMM yyyy, HH:mm a").toLowerCase();
    } catch { return dateStr; }
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [hundiRes, templeRes, deityRes, masterRes] = await Promise.all([
        api.get("/v1/hundi"),
        api.get(`/v1/organizations/${user?.organization_id}/temples`),
        api.get('/v1/temple/deities'),
        api.get('/v1/hundi/master')
      ])

      const tMap: Record<string, string> = {}
      templeRes.data?.data?.forEach((t: LookupItem) => { tMap[String(t.id)] = t.name; })
      setTempleMap(tMap)

      const dMap: Record<string, string> = {}
      const deitiesByTemple: Record<string, number> = {}

      deityRes.data?.data?.forEach((d: LookupItem) => {
        dMap[String(d.id)] = d.name;
        if (d.temple_id) {
          const tIdStr = String(d.temple_id);
          deitiesByTemple[tIdStr] = (deitiesByTemple[tIdStr] || 0) + 1;
        }
      })
      setDeitiesList(deityRes.data?.data || [])
      setDefinedHundis(masterRes.data?.data || [])

      const rawData = hundiRes.data.data || []

      setData(rawData.map((item: Hundi, index: number) => {
        const tIdStr = String(item.temple_id);
        let deityNameStr = "General";
        let selectedIds: string[] = [];

        if (item.deity_ids) {
          selectedIds = item.deity_ids.split(',').map(s => s.trim()).filter(Boolean);
        } else if (item.deity_id) {
          selectedIds = [String(item.deity_id)];
        }

        if (selectedIds.length > 0) {
          const totalTempleDeities = deitiesByTemple[tIdStr] || 0;
          if (totalTempleDeities > 0 && selectedIds.length === totalTempleDeities) {
            deityNameStr = "All";
          } else {
            const resolvedNames = selectedIds.map(id => dMap[id]).filter(Boolean);
            if (resolvedNames.length > 0) {
              deityNameStr = resolvedNames.join(", ");
            }
          }
        }

        return {
          ...item,
          sl_no: index + 1,
          _temple_name: tMap[tIdStr] || "Unknown",
          _deity_name: deityNameStr
        };
      }))
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync records")
    } finally {
      setIsLoading(false)
    }
  }, [user?.organization_id]);

  useEffect(() => { fetchData() }, [fetchData])

  const handleView = async (row: Hundi) => {
    setIsViewOpen(true)
    setIsLoadingDetails(true)
    try {
      const response = await api.get(`/v1/hundi/${row.id}`)
      const viewDataDetailed = response.data.data;

      setViewData({
        ...viewDataDetailed,
        _deity_name: row._deity_name,
        _temple_name: row._temple_name
      });
    } catch {
      toast.error("Could not load details")
      setIsViewOpen(false)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const confirmDelete = async () => {
    try {
      if (deleteTarget?.type === 'single' && deleteTarget.id) {
        await api.delete(`/v1/hundi/${deleteTarget.id}`)
      } else if (deleteTarget?.type === 'bulk') {
        await Promise.all(selectedIds.map(id => api.delete(`/v1/hundi/${id}`)))
        setSelectedIds([])
      }
      toast.success("Deleted successfully")
      fetchData()
    } catch { toast.error("Delete failed") }
    setIsDeleteDialogOpen(false)
  }

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === data.length) setSelectedIds([])
    else setSelectedIds(data.map(h => h.id))
  }, [data, selectedIds])

  const handleDefineSubmit = async () => {
    if (!defineData.deity_id || !defineData.hundi_name || !defineData.hundi_number) {
      return toast.error("Please fill in all required fields.")
    }
    setIsSubmittingDefine(true)
    try {
      await api.post('/v1/hundi/master', {
        organization_id: user?.organization_id,
        temple_id: Number(defineData.temple_id),
        deity_id: Number(defineData.deity_id),
        hundi_name: defineData.hundi_name,
        hundi_number: defineData.hundi_number
      })
      toast.success("Hundi defined successfully!")
      setDefineData(prev => ({ ...prev, hundi_name: "", hundi_number: "", deity_id: "" }))

      const masterRes = await api.get('/v1/hundi/master')
      setDefinedHundis(masterRes.data?.data || [])

    } catch (error) {
      console.error("Error defining hundi:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to define Hundi.")
    } finally {
      setIsSubmittingDefine(false)
    }
  }

  const handleDeleteMasterHundi = async (id: number) => {
    const hundiToDelete = definedHundis.find(h => h.id === id);
    const deity = deitiesList.find(d => d.id === hundiToDelete?.deity_id);
    const deityName = deity ? deity.name : "Deity";

    try {
      await api.delete(`/v1/hundi/master/${id}`);
      toast.success(`${deityName} hundi has been deleted successfully`);
      setDefinedHundis(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error("Error deleting master hundi:", error);
      toast.error(`Failed to remove ${deityName} hundi`);
    }
  };
  const availableDeitiesToDefine = useMemo(() => {
    const activeTid = defineData.temple_id || String(user?.temple_id || "");
    if (!activeTid) return [];

    const mappedDeityIds = new Set(
      definedHundis
        .filter(h => String(h.temple_id) === activeTid)
        .map(h => String(h.deity_id))
    );

    return deitiesList.filter(d =>
      String(d.temple_id) === activeTid && !mappedDeityIds.has(String(d.id))
    );
  }, [defineData.temple_id, user?.temple_id, deitiesList, definedHundis]);


  const columns = useMemo(() => {
    const cols: TableColumn[] = [
      {
        key: "id",
        label: <Checkbox checked={selectedIds.length === data.length && data.length > 0} onCheckedChange={toggleSelectAll} />,
        render: (h) => <Checkbox checked={selectedIds.includes(h.id)} onCheckedChange={() => setSelectedIds(prev => prev.includes(h.id) ? prev.filter(i => i !== h.id) : [...prev, h.id])} />
      },
      { key: "opened_at", label: "Opened Date", render: (h) => <span className="font-medium whitespace-nowrap">{formatFriendlyDate(h.opened_at)}</span> },
    ]

    if (user?.user_type === 'org_admin') {
      cols.push({ key: "temple_id", label: "Temple", render: (h) => <span className="font-semibold tracking-tight">{h._temple_name}</span> })
    }

    cols.push(
      { key: "deity_id", label: "Deities", render: (h) => <span className="max-w-xs whitespace-normal wrap-break-word block leading-snug">{h._deity_name}</span> },
      { key: "total_amount", label: "Cash (₹)", render: (h) => <span className="font-bold">₹{Number(h.total_amount).toLocaleString('en-IN')}</span> }
    )

    return cols as unknown as never[];
  }, [data, selectedIds, user, toggleSelectAll])

  const renderProof = (filename: string | undefined, label: string) => {
    if (!filename) return null;
    const url = `${STATIC_IMAGE_URL}${filename}`;
    const isPdf = filename.toLowerCase().endsWith('.pdf');

    return (
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-muted-foreground uppercase">{label}</p>
        <div
          className="h-28 w-28 rounded-md border shadow-sm bg-white cursor-pointer hover:opacity-80 flex items-center justify-center overflow-hidden"
          onClick={() => window.open(url, '_blank')}
          title="Click to Open"
        >
          {isPdf ? (
            <div className="flex flex-col items-center justify-center text-red-500">
              <FileText className="h-10 w-10" />
              <span className="text-[9px] font-medium text-muted-foreground mt-1">PDF File</span>
            </div>
          ) : (
            <img src={url} alt={label} className="h-full w-full object-cover" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <AppBreadcrumb items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Hundi Collections" }]} />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Hundi Collections</h2>
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => { setDeleteTarget({ type: 'bulk' }); setIsDeleteDialogOpen(true); }}>
                Delete ({selectedIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsDefineOpen(true)} className="gap-2">
              <Box className="h-4 w-4" /> Define Hundi
            </Button>
            <Button size="sm" onClick={() => navigate("/hundi/add")}>+ Add New</Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 border rounded-lg"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <DataTable<Hundi>
            data={data}
            storageKey="hundi_v10_table"
            columns={columns}
            onEdit={(row) => navigate(`/hundi/${row.id}/edit`)}
            onView={handleView}
            onDelete={(row) => { setDeleteTarget({ type: 'single', id: row.id }); setIsDeleteDialogOpen(true); }}
          />
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Record</DialogTitle><DialogDescription>This action is permanent and cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDefineOpen} onOpenChange={setIsDefineOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Define Master Hundi</DialogTitle>
            <DialogDescription>
              Map a specific hundi name and number to a deity to quickly identify it during collection.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 p-4 border rounded-lg bg-muted/10">
              {isOrgAdmin && (
                <div className="grid gap-2">
                  <Label>Temple <span className="text-red-500">*</span></Label>
                  <Select value={defineData.temple_id} onValueChange={(val) => setDefineData({ ...defineData, temple_id: val, deity_id: "" })}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select Temple" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(templeMap).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Deity <span className="text-red-500">*</span></Label>
                  <Select value={defineData.deity_id} onValueChange={(val) => setDefineData({ ...defineData, deity_id: val })} disabled={!defineData.temple_id}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder={availableDeitiesToDefine.length === 0 ? "No Available Deities" : "Select Deity"} /></SelectTrigger>
                    <SelectContent>
                      {availableDeitiesToDefine.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                      {availableDeitiesToDefine.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground italic text-center">All deities are assigned!</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Hundi Number <span className="text-red-500">*</span></Label>
                  <Input className="bg-background" placeholder="e.g. HN-001" value={defineData.hundi_number} onChange={(e) => setDefineData({ ...defineData, hundi_number: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Hundi Name <span className="text-red-500">*</span></Label>
                <Input className="bg-background" placeholder="e.g. Main Entrance Box" value={defineData.hundi_name} onChange={(e) => setDefineData({ ...defineData, hundi_name: e.target.value })} />
              </div>

              <Button className="mt-2" onClick={handleDefineSubmit} disabled={isSubmittingDefine || !defineData.deity_id}>
                {isSubmittingDefine ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />} Add Hundi
              </Button>
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-semibold leading-none tracking-tight mb-4">Currently Defined Hundis</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {definedHundis.filter(h => String(h.temple_id) === (defineData.temple_id || String(user?.temple_id))).length === 0 ? (
                  <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-md">No hundis defined for this temple.</p>
                ) : (
                  definedHundis.filter(h => String(h.temple_id) === (defineData.temple_id || String(user?.temple_id))).map(h => (
                    <div key={h.id} className="flex justify-between items-center p-3 border rounded-md bg-background shadow-sm group">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-none mb-1.5">{h.hundi_name} <span className="text-muted-foreground font-normal ml-1">({h.hundi_number})</span></p>
                        <p className="text-[11px] text-muted-foreground leading-none">Assigned to: <span className="font-medium text-foreground ml-1">{deitiesList.find(d => d.id === h.deity_id)?.name || "Unknown"}</span></p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 transition-colors" onClick={() => handleDeleteMasterHundi(h.id)}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove Hundi</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 sm:justify-start">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full sm:w-auto">Close Panel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DrawerContent className="max-h-[92vh]">
          <div className="mx-auto w-full max-w-5xl overflow-y-auto px-6 py-6">
            <DrawerHeader className="px-0 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="space-y-1">
                <DrawerTitle className="text-3xl font-bold tracking-tight">Hundi Details</DrawerTitle>
                <DrawerDescription className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" /> {viewData?.opened_at && formatFriendlyDate(viewData.opened_at)}
                  <span className="text-muted-foreground ml-2 border-l pl-2 font-mono">ID: {viewData?.id}</span>
                </DrawerDescription>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm" onClick={() => navigate(`/hundi/${viewData?.id}/edit`)}>Edit Record</Button>
                <DrawerClose asChild><Button variant="secondary" size="sm">Close</Button></DrawerClose>
              </div>
            </DrawerHeader>

            <Separator className="my-4" />

            {isLoadingDetails ? (
              <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
            ) : viewData ? (
              <div className="space-y-10 pb-12">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Temple</Label>
                    <p className="font-semibold truncate">{viewData._temple_name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Deities Included</Label>
                    <p className="font-semibold whitespace-normal wrap-break-word">{viewData._deity_name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Total Cash</Label>
                    <p className="font-bold text-lg">₹{Number(viewData.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1">Items Est.</Label>
                    <p className="font-bold text-lg">₹{Number(viewData.total_items_value).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2"><User className="h-4 w-4" /> Present Witnesses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {viewData.witnesses?.map((w, i) => (
                        <div key={i} className="p-3 border rounded-lg bg-muted/10">
                          <p className="font-semibold text-sm">{w.name}</p>
                          <p className="text-[11px] text-muted-foreground">{w.designation} &bull; {w.phone}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-2"><ImageIcon className="h-4 w-4" /> Digital Proofs</h3>
                    <div className="flex gap-4">
                      {renderProof(viewData.hundi_img_name, "Witness Photo")}
                      {renderProof(viewData.hundi_witness_signature, "Signature Scan")}
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Coins className="h-4 w-4" /> Cash Breakdown</h3>
                    <div className="border rounded-md overflow-hidden bg-background">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b"><tr><th className="p-2.5 text-left font-medium">Denomination</th><th className="p-2.5 text-center font-medium">Qty</th><th className="p-2.5 text-right font-medium">Subtotal</th></tr></thead>
                        <tbody className="divide-y">
                          {viewData.denominations?.map((d, i) => (
                            <tr key={i}><td className="p-2.5 font-medium">₹{d.denomination_value}</td><td className="p-2.5 text-center text-muted-foreground">{d.quantity}</td><td className="p-2.5 text-right font-semibold">₹{Number(d.subtotal).toLocaleString('en-IN')}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Gem className="h-4 w-4" /> Physical Items</h3>
                    <div className="border rounded-md overflow-hidden bg-background">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b"><tr><th className="p-2.5 text-left font-medium">Item</th><th className="p-2.5 text-center font-medium">Qty</th><th className="p-2.5 text-right font-medium">Est. Value</th></tr></thead>
                        <tbody className="divide-y">
                          {viewData.items?.length ? viewData.items.map((item, i) => (
                            <tr key={i}>
                              <td className="p-2.5">
                                <div className="font-medium">{item.item_name}</div>
                                <div className="text-[10px] text-muted-foreground italic truncate max-w-40">{item.description}</div>
                              </td>
                              <td className="p-2.5 text-center text-muted-foreground">{item.quantity} {item.unit}</td>
                              <td className="p-2.5 text-right font-semibold">₹{Number(item.estimated_value || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          )) : <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No physical items recorded.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="p-4 border-l-4 border-muted-foreground/30 bg-muted/10 rounded-r-lg">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Administrative Remarks</p>
                  <p className="text-sm text-foreground/80 italic">"{viewData.remark || "Standard collection process verified."}"</p>
                </div>

              </div>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}