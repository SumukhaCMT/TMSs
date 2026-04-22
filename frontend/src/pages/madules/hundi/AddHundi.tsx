import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
import {
    Trash2, CheckCircle2, Loader2, X, Plus, UploadCloud, Eye, Wallet, Package,
    Calculator, Calendar as CalendarIcon, Clock, Printer, FileUp, FileText, Image as ImageIcon
} from "lucide-react"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import api from "@/axios/axios"
import { secureStorage } from "@/utils/secureStorage"
import { toast } from "sonner"
import imageCompression from 'browser-image-compression'
import { cn } from "@/lib/utils"

interface TempleResponse { id: number; name: string; }
interface DeityResponse { id: number; name: string; temple_id?: number; organization_id?: number; }
interface RoleResponse { name: string; }
interface UnitResponse { unit_name: string; }
interface UnitOption { label: string; value: string; }
interface DefinedHundi { id: number; hundi_name: string; hundi_number: string; deity_id: number; temple_id: number; }

interface WitnessSuggestion { name: string; designation?: string; email?: string; phone?: string; address_line1?: string; address_line2?: string; city?: string; pincode?: string; }
interface WitnessData { id: number; name: string; designation: string; custom_designation: string; email: string; phone: string; address_line1: string; address_line2: string; city: string; pincode: string; state: string; country: string; remark: string; isAutoFilled?: boolean;[key: string]: string | number | boolean | undefined; }
interface HundiImage { id: number; name: string; file_data: string; preview: string; }
interface PreviewData { total_amount: number; total_items_value: number; grand_total: number; general_remark: string; }
interface ItemData { id: number; item_name: string; quantity: string | number; unit: string; custom_unit: string; weight_value: string | number; estimated_value: string | number; description: string; }

const CASH_DENOMINATIONS = [
    { type: "note", value: 2000, label: "₹ 2000" }, { type: "note", value: 500, label: "₹ 500" },
    { type: "note", value: 200, label: "₹ 200" }, { type: "note", value: 100, label: "₹ 100" },
    { type: "note", value: 50, label: "₹ 50" }, { type: "note", value: 20, label: "₹ 20" },
    { type: "note", value: 10, label: "₹ 10" }, { type: "coin", value: 20, label: "₹ 20" },
    { type: "coin", value: 10, label: "₹ 10" }, { type: "coin", value: 5, label: "₹ 5" },
    { type: "coin", value: 2, label: "₹ 2" }, { type: "coin", value: 1, label: "₹ 1" },
    { type: "coin", value: 0.5, label: "50p" },
];

const UNIT_OPTIONS: UnitOption[] = [
    { label: "Grams (gms)", value: "gms" }, { label: "Kilograms (kgs)", value: "kgs" },
    { label: "Milligrams (mg)", value: "mg" }, { label: "Pieces (pcs)", value: "pcs" },
    { label: "Other (Custom)", value: "Other" },
];

function DeityMultiSelect({ items, selected, onChange }: { items: string[], selected: string[], onChange: (val: string[]) => void }) {
    const anchor = useComboboxAnchor()
    return (
        <Combobox
            multiple
            autoHighlight
            items={items}
            value={selected}
            onValueChange={(newVals: string[]) => {
                if (newVals.includes("Select All")) {
                    const allOptions = items.filter(i => i !== "Select All")
                    if (selected.length === allOptions.length) onChange([])
                    else onChange(allOptions)
                } else {
                    onChange(newVals)
                }
            }}
        >
            <ComboboxChips ref={anchor} className="w-full min-h-10 border border-input bg-transparent px-3 py-2 text-sm ring-offset-background rounded-md flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <ComboboxValue>
                    {(values: string[]) => (
                        <React.Fragment>
                            {values.map((value: string) => (
                                <ComboboxChip key={value} className="bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 text-xs flex items-center gap-1 cursor-pointer">
                                    {value}
                                </ComboboxChip>
                            ))}
                            <ComboboxChipsInput placeholder={selected.length === 0 ? "Select Deities..." : ""} className="bg-transparent outline-none flex-1 min-w-30 text-sm" />
                        </React.Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor} className="z-50 w-full bg-popover text-popover-foreground shadow-md rounded-md border p-1 mt-1">
                <ComboboxEmpty className="p-2 text-sm text-center text-muted-foreground">No deities found.</ComboboxEmpty>
                <ComboboxList>
                    {(item: string) => (
                        <ComboboxItem key={item} value={item} className="cursor-pointer flex items-center p-2 text-sm hover:bg-muted rounded-sm transition-colors data-highlighted:bg-muted data-highlighted:text-accent-foreground">
                            {item}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}

export default function AddHundi() {
    const navigate = useNavigate()
    const user = secureStorage.getItem("user") as { organization_id: number; temple_id: number | null } | null

    const [date, setDate] = useState<Date | undefined>(new Date())
    const [time, setTime] = useState<string>(format(new Date(), "HH:mm"))

    const [selectedTemple, setSelectedTemple] = useState<string>(user?.temple_id ? String(user.temple_id) : "")

    const [allDeities, setAllDeities] = useState<DeityResponse[]>([])
    const [definedHundis, setDefinedHundis] = useState<DefinedHundi[]>([])
    const [selectedDeities, setSelectedDeities] = useState<string[]>([])

    const [templesList, setTemplesList] = useState<{ id: number, name: string }[]>([])
    const [rolesList, setRolesList] = useState<{ label: string, value: string }[]>([])
    const [unitList, setUnitList] = useState<UnitOption[]>([...UNIT_OPTIONS])

    const [witnesses, setWitnesses] = useState<WitnessData[]>(() => [
        {
            id: Date.now(),
            name: "", designation: "", custom_designation: "", email: "", phone: "",
            address_line1: "", address_line2: "", city: "", pincode: "", state: "Karnataka", country: "India", remark: "",
            isAutoFilled: false
        }
    ])
    const [witnessErrors, setWitnessErrors] = useState<Record<string, string>[]>([]);
    const [activeWitnessIndex, setActiveWitnessIndex] = useState<number | null>(null);
    const [witnessSuggestions, setWitnessSuggestions] = useState<WitnessSuggestion[]>([]);

    const [cashQuantities, setCashQuantities] = useState<Record<string, string>>({})
    const [items, setItems] = useState<ItemData[]>([])

    const [hundiImages, setHundiImages] = useState<HundiImage[]>([])
    const [processingImgType, setProcessingImgType] = useState<string | null>(null)
    const [viewImage, setViewImage] = useState<string | null>(null)

    const [generalRemark, setGeneralRemark] = useState<string>("")
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [createdHundiId, setCreatedHundiId] = useState<number | null>(null)
    const [signatureFile, setSignatureFile] = useState<File | null>(null)

    const calculatedTotalCash = useMemo(() => CASH_DENOMINATIONS.reduce((total, denom) => {
        const key = `${denom.type}_${denom.value}`;
        const qty = Number(cashQuantities[key] || 0);
        return total + (qty * denom.value);
    }, 0), [cashQuantities]);

    const calculatedTotalItems = useMemo(() => items.reduce((acc, curr) => acc + (Number(curr.estimated_value) || 0), 0), [items]);
    const grandTotal = calculatedTotalCash + calculatedTotalItems;

    const filteredDeities = useMemo(() => {
        const activeTempleId = selectedTemple || (user?.temple_id ? String(user.temple_id) : "");
        if (!activeTempleId) return [];

        const templeDeities = allDeities.filter(d => String(d.temple_id) === activeTempleId);

        const deitiesWithHundis = new Set(
            definedHundis
                .filter(h => String(h.temple_id) === activeTempleId)
                .map(h => Number(h.deity_id))
        );

        return templeDeities.filter(d => deitiesWithHundis.has(Number(d.id)));
    }, [selectedTemple, allDeities, definedHundis, user?.temple_id]);

    const deityComboboxOptions = useMemo(() => {
        const options = filteredDeities.map(d => d.name);
        return ["Select All", ...options];
    }, [filteredDeities]);

    const displayDeities = useMemo(() => {
        if (selectedDeities.length === 0) return "None";
        if (filteredDeities.length > 0 && selectedDeities.length === filteredDeities.length) return "All";
        return selectedDeities.join(", ");
    }, [selectedDeities, filteredDeities]);

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                if (user?.organization_id) {
                    const templeRes = await api.get(`/v1/organizations/${user.organization_id}/temples`);
                    if (templeRes.data?.data) setTemplesList(templeRes.data.data.map((t: TempleResponse) => ({ id: t.id, name: t.name })));
                }
                const deitiesRes = await api.get('/v1/temple/deities');
                if (deitiesRes.data?.data) setAllDeities(deitiesRes.data.data);

                const masterRes = await api.get('/v1/hundi/master');
                if (masterRes.data?.data) setDefinedHundis(masterRes.data.data);

            } catch (error) {
                console.error(error);
            }
        };
        fetchStaticData();
    }, [user?.organization_id]);

    useEffect(() => {
        const fetchRoles = async () => {
            const activeTempleId = selectedTemple || (user?.temple_id ? String(user.temple_id) : "");
            if (!user?.organization_id) return;
            try {
                const rolesRes = await api.get(`/v1/hundi/roles?organization_id=${user.organization_id}&temple_id=${activeTempleId}`);
                if (rolesRes.data?.data) {
                    const uniqueRoles = Array.from(new Set(rolesRes.data.data.map((r: RoleResponse) => r.name)))
                        .map(name => ({ label: name as string, value: name as string }));
                    if (!uniqueRoles.find(r => r.value === 'Trustee')) uniqueRoles.unshift({ label: "Trustee", value: "Trustee" });
                    uniqueRoles.push({ label: "Other (Custom)", value: "Other" });
                    setRolesList(uniqueRoles);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchRoles();
    }, [user?.organization_id, selectedTemple, user?.temple_id]);

    useEffect(() => {
        const activeId = selectedTemple || (user?.temple_id ? String(user.temple_id) : "");
        if (activeId) {
            api.get(`/v1/hundi/item-units?temple_id=${activeId}`).then(res => {
                if (res.data?.data) {
                    const dbUnits: UnitOption[] = res.data.data.map((u: UnitResponse) => ({ label: u.unit_name, value: u.unit_name }));
                    setUnitList(() => {
                        const combined = [...UNIT_OPTIONS];
                        dbUnits.forEach(dbU => {
                            if (!combined.some(opt => opt.value.toLowerCase() === dbU.value.toLowerCase())) combined.splice(combined.length - 1, 0, dbU);
                        });
                        return combined;
                    });
                }
            }).catch(e => console.error("Error fetching units:", e));
        }
    }, [selectedTemple, user?.temple_id]);

    const validateWitnessField = (index: number, field: string, value: string) => {
        const newErrors = [...witnessErrors];
        if (!newErrors[index]) newErrors[index] = {};
        if (field === "phone") {
            if (!/^\d{10}$/.test(value)) newErrors[index].phone = "Must be exactly 10 digits";
            else delete newErrors[index].phone;
        }
        if (field === "email" && value) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[index].email = "Invalid email format";
            else delete newErrors[index].email;
        }
        if (field === "name") {
            if (!value.trim()) newErrors[index].name = "Name is required";
            else delete newErrors[index].name;
        }
        if (field === "designation") {
            if (!value) newErrors[index].designation = "Designation is required";
            else delete newErrors[index].designation;
        }
        setWitnessErrors(newErrors);
    };

    const handleWitnessSearch = async (index: number, val: string) => {
        const activeTempleId = selectedTemple || user?.temple_id;
        updateWitness(index, "name", val);
        if (val.length < 2 || !activeTempleId) return setWitnessSuggestions([]);
        try {
            const res = await api.get(`/v1/hundi/witness-suggestions/${activeTempleId}?query=${val}`);
            if (res.data?.success) {
                const existingPhones = witnesses.filter((_, idx) => idx !== index).map(w => w.phone).filter(p => p);
                const filteredSuggestions = res.data.data.filter((s: WitnessSuggestion) => !existingPhones.includes(s.phone || ""));
                setActiveWitnessIndex(index);
                setWitnessSuggestions(filteredSuggestions);
            }
        } catch (err) { console.error(err); }
    };

    const selectWitnessSuggestion = (index: number, suggestion: WitnessSuggestion) => {
        const updated = [...witnesses];
        const incomingDesignation = suggestion.designation || "";
        if (incomingDesignation) {
            const exists = rolesList.some(r => r.value.toLowerCase() === incomingDesignation.toLowerCase());
            if (!exists) {
                setRolesList(prev => {
                    const newList = [...prev];
                    const otherIndex = newList.findIndex(r => r.value === "Other");
                    const newOption = { label: incomingDesignation, value: incomingDesignation };
                    if (otherIndex !== -1) newList.splice(otherIndex, 0, newOption);
                    else newList.push(newOption);
                    return newList;
                });
            }
        }
        updated[index] = {
            ...updated[index], name: suggestion.name, designation: incomingDesignation, custom_designation: "",
            email: suggestion.email || "", phone: suggestion.phone || "", address_line1: suggestion.address_line1 || "",
            address_line2: suggestion.address_line2 || "", city: suggestion.city || "", pincode: suggestion.pincode || "", isAutoFilled: true
        };
        setWitnesses(updated);
        setWitnessSuggestions([]);
        setActiveWitnessIndex(null);
        validateWitnessField(index, "name", suggestion.name);
        validateWitnessField(index, "phone", suggestion.phone || "");
        validateWitnessField(index, "designation", incomingDesignation);
    };

    const addNewWitnessForm = () => { setWitnesses([...witnesses, { id: Date.now() + Math.random(), name: "", designation: "", custom_designation: "", email: "", phone: "", address_line1: "", address_line2: "", city: "", pincode: "", state: "Karnataka", country: "India", remark: "", isAutoFilled: false }]); setWitnessErrors([...witnessErrors, {}]); };
    const removeWitnessForm = (index: number) => { if (witnesses.length === 1) return toast.error("At least one witness is required."); setWitnesses(witnesses.filter((_, i) => i !== index)); setWitnessErrors(witnessErrors.filter((_, i) => i !== index)); };
    const updateWitness = (index: number, field: keyof WitnessData, value: string) => { const updated = [...witnesses]; updated[index] = { ...updated[index], [field]: value }; if (field === "name") updated[index].isAutoFilled = false; setWitnesses(updated); validateWitnessField(index, field as string, value); };

    const addNewItemForm = () => { setItems([...items, { id: Date.now() + Math.random(), item_name: "", quantity: 1, unit: "gms", custom_unit: "", weight_value: "", estimated_value: "", description: "" }]); };

    const deleteCustomUnit = async (unitName: string) => {
        const activeId = selectedTemple || user?.temple_id;
        if (!activeId) return;
        const originalList = [...unitList];
        setUnitList(prev => prev.filter(u => u.value !== unitName));
        try {
            const res = await api.post(`/v1/hundi/item-units/delete`, { temple_id: Number(activeId), unit_name: unitName });
            if (res.data?.success) toast.success("Unit deleted successfully");
            else throw new Error("Failed to delete");
        } catch (error) {
            console.error(error);
            setUnitList(originalList);
            toast.error("Failed to delete unit from database");
        }
    };

    const updateItem = (index: number, field: keyof ItemData, value: string | number) => { const updated = [...items]; updated[index] = { ...updated[index], [field]: value }; setItems(updated); };
    const removeItem = (index: number) => { setItems(items.filter((_, i) => i !== index)); };

    const handleCashChange = (type: string, value: number, qtyStr: string) => { if (qtyStr === "" || /^\d+$/.test(qtyStr)) setCashQuantities(prev => ({ ...prev, [`${type}_${value}`]: qtyStr })); };

    const handleSpecificImageUpload = async (file: File) => {
        setProcessingImgType("Hundi Witness");
        try {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" };
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => {
                setHundiImages([{ id: Date.now(), name: "Hundi Witness", file_data: reader.result as string, preview: reader.result as string }]);
                setProcessingImgType(null);
            }
        } catch (err) {
            console.error(err);
            setProcessingImgType(null);
            toast.error("Failed to process image");
        }
    };

    const handleSignatureUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) return toast.error("File size must be under 5MB");
            setSignatureFile(file);
        }
    };
    const removeImage = () => { setHundiImages([]); };

    const handleReviewHundi = () => {
        if (!date) return toast.error("Please select Opened At Date");
        if (!time) return toast.error("Please select Opened At Time");
        if (!selectedTemple) return toast.error("Please select a Temple");
        if (selectedDeities.length === 0) return toast.error("Please select at least one Deity.");

        let isValid = true;
        witnesses.forEach((w, i) => {
            if (!w.name || !w.designation || !w.phone) { toast.error(`Please fill mandatory fields for Witness #${i + 1}`); isValid = false; }
            if (witnessErrors[i] && Object.keys(witnessErrors[i]).length > 0) { toast.error(`Fix errors for Witness #${i + 1}`); isValid = false; }
        });
        if (!isValid) return;

        for (let i = 0; i < items.length; i++) {
            if (!items[i].item_name) return toast.error(`Item Name is required for Item #${i + 1}`);
        }

        setPreviewData({ total_amount: calculatedTotalCash, total_items_value: calculatedTotalItems, grand_total: grandTotal, general_remark: generalRemark });
    }

    const confirmAndSaveToDatabase = async () => {
        if (!previewData || !date) return;
        setIsSubmitting(true);
        const dateStr = format(date, "yyyy-MM-dd");
        const dateTimeStr = `${dateStr} ${time}:00`;

        const finalItems = items.map(i => ({
            item_name: i.item_name, quantity: Number(i.quantity), unit: i.unit === "Other" ? (i.custom_unit.trim() || "Other") : i.unit,
            estimated_value: Number(i.estimated_value), description: i.description, weight_value: i.weight_value
        }));

        const selectedDeityIds = selectedDeities.map(nameStr => {
            const match = allDeities.find(d => d.name === nameStr);
            return match ? match.id : null;
        }).filter(Boolean);

        const deityIdsString = selectedDeityIds.join(",");

        const formData = new FormData();
        const jsonData = {
            organization_id: user?.organization_id,
            temple_id: Number(selectedTemple || user?.temple_id),
            opened_at: dateTimeStr,
            deity_ids: deityIdsString,
            deity_id: selectedDeityIds.length === 1 ? selectedDeityIds[0] : null,
            total_amount: calculatedTotalCash,
            total_items_value: calculatedTotalItems,
            remark: generalRemark,
            witnesses: witnesses.map(w => ({ ...w, designation: w.designation === "Other" ? w.custom_designation : w.designation })),
            denominations: CASH_DENOMINATIONS.map(d => {
                const qty = Number(cashQuantities[`${d.type}_${d.value}`] || 0);
                return qty > 0 ? { denomination_type: d.type, denomination_value: d.value, quantity: qty } : null;
            }).filter(Boolean),
            items: finalItems
        };
        formData.append("data", JSON.stringify(jsonData));

        const witnessImg = hundiImages.find(img => img.name === "Hundi Witness");
        if (witnessImg) {
            const res = await fetch(witnessImg.file_data);
            formData.append("witness_img", await res.blob(), "witness.webp");
        }

        try {
            const res = await api.post("/v1/hundi", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newHundiId = res.data.data.insertId || res.data.data.id;
            toast.success("Hundi Created successfully! You can now print and upload a signature.");
            setCreatedHundiId(newHundiId);
            setIsSubmitting(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save hundi draft.");
            setIsSubmitting(false);
        }
    }

    const handleFinalSubmit = async () => {
        if (signatureFile && createdHundiId) {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("signature_img", signatureFile);
            try {
                await api.put(`/v1/hundi/${createdHundiId}/finalize`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success("Hundi fully finalized with signature!");
            } catch (error) {
                console.error(error);
                toast.error("Failed to upload signature. Document saved without signature.");
            }
            finally { setIsSubmitting(false); }
        }
        setPreviewData(null);
        setCreatedHundiId(null);
        navigate("/hundi");
    }

    const handlePrint = () => window.print();

    const witnessImg = hundiImages.find(img => img.name === "Hundi Witness");

    return (
        <div className="flex flex-col gap-8 pb-10 w-full" onClick={() => setWitnessSuggestions([])}>
            <style>
                {`@media print { body * { visibility: hidden; } #printable-invoice, #printable-invoice * { visibility: visible; } #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; } @page { margin: 5mm; size: auto; margin-top: 0; margin-bottom: 0; } }`}
            </style>

            <div className="print:hidden flex flex-col gap-8 w-full">
                <AppBreadcrumb items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Hundi List", to: "/hundi" }, { label: "Add Hundi" }]} />

                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-foreground">1. Basic Details</h2>
                    <Card className="p-6 border-border shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 flex flex-col">
                                <Label>Opened At <span className="text-red-500">*</span></Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal border-input", !date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? <>{format(date, "PPP")} <span className="ml-2 text-muted-foreground border-l pl-2">{time}</span></> : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date: Date) => date > new Date()} initialFocus className="p-3" />
                                        <div className="p-3 border-t bg-muted/20">
                                            <Label className="text-xs text-muted-foreground">Opened Time</Label>
                                            <div className="relative mt-2">
                                                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-8" />
                                                <Clock className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Temple <span className="text-red-500">*</span></Label>
                                <Select value={selectedTemple} onValueChange={(v) => { setSelectedTemple(v); setSelectedDeities([]); }}>
                                    <SelectTrigger><SelectValue placeholder="Choose Temple" /></SelectTrigger>
                                    <SelectContent>
                                        {templesList.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Deities <span className="text-red-500">*</span></Label>
                                <DeityMultiSelect
                                    items={deityComboboxOptions}
                                    selected={selectedDeities}
                                    onChange={setSelectedDeities}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. Witness Details */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h2 className="text-xl font-bold text-foreground">2. Witness Details</h2>
                    </div>
                    {witnesses.map((w, index) => (
                        <div key={w.id} className="relative rounded-xl border bg-white p-5 shadow-sm group">
                            <div className="absolute right-4 top-4">
                                {witnesses.length > 1 && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => removeWitnessForm(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Witness #{index + 1}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="space-y-1 relative">
                                    <Label>Full Name <span className="text-red-500">*</span></Label>
                                    <Input placeholder="Search name..." value={w.name} onChange={(e) => updateWitness(index, "name", e.target.value)} onBlur={(e) => handleWitnessSearch(index, e.target.value)} />
                                    {witnessErrors[index]?.name && <p className="text-[10px] text-red-500 font-medium">{witnessErrors[index].name}</p>}

                                    {activeWitnessIndex === index && witnessSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full bg-background border rounded-md shadow-lg top-full mt-1">
                                            {witnessSuggestions.map((s, i) => (
                                                <div key={i} className="p-2 hover:bg-muted cursor-pointer text-sm border-b last:border-0" onClick={() => selectWitnessSuggestion(index, s)}>
                                                    <p className="font-bold">{s.name}</p>
                                                    <p className="text-xs text-muted-foreground">{s.phone} | {s.designation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1"><Label>Designation <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <Select value={w.designation} onValueChange={(val) => updateWitness(index, "designation", val)} disabled={w.isAutoFilled}>
                                            <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>{rolesList.map((r, i) => <SelectItem key={i} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                        {w.designation === "Other" && <Input placeholder="Custom" value={w.custom_designation} onChange={(e) => updateWitness(index, "custom_designation", e.target.value)} className="w-1/2" disabled={w.isAutoFilled} />}
                                    </div>
                                    {witnessErrors[index]?.designation && <p className="text-[10px] text-red-500 font-medium">{witnessErrors[index].designation}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Email</Label>
                                    <Input placeholder="Email" value={w.email} onChange={(e) => updateWitness(index, "email", e.target.value)} />
                                    {witnessErrors[index]?.email && <p className="text-[10px] text-red-500 font-medium">{witnessErrors[index].email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Phone <span className="text-red-500">*</span></Label>
                                    <Input placeholder="10 digit mobile" value={w.phone} onChange={(e) => updateWitness(index, "phone", e.target.value.replace(/\D/g, '').slice(0, 10))} />
                                    {witnessErrors[index]?.phone && <p className="text-[10px] text-red-500 font-medium">{witnessErrors[index].phone}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1"><Label>Address Line 1</Label><Input placeholder="House No, Street" value={w.address_line1} onChange={(e) => updateWitness(index, "address_line1", e.target.value)} /></div>
                                <div className="space-y-1"><Label>Address Line 2</Label><Input placeholder="Area, Landmark" value={w.address_line2} onChange={(e) => updateWitness(index, "address_line2", e.target.value)} /></div>
                                <div className="space-y-1"><Label>City</Label><Input placeholder="City" value={w.city} onChange={(e) => updateWitness(index, "city", e.target.value)} /></div>
                                <div className="space-y-1"><Label>Remarks</Label><Input placeholder="Any notes" value={w.remark} onChange={(e) => updateWitness(index, "remark", e.target.value)} /></div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-start"><Button onClick={addNewWitnessForm} variant="secondary" className="gap-2"><Plus className="h-4 w-4" /> Add Another Witness</Button></div>
                </div>

                {/* 3. Cash Denominations */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-foreground">3. Cash Denominations</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                {CASH_DENOMINATIONS.map((d) => {
                                    const key = `${d.type}_${d.value}`;
                                    const qty = Number(cashQuantities[key] || 0);
                                    const subtotal = qty * d.value;

                                    return (
                                        <div key={key} className="flex justify-between items-center py-2 border-b border-border group hover:bg-muted/10 px-2 rounded-sm transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{d.label}</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${d.type === 'note' ? 'text-blue-500' : 'text-orange-500'}`}>{d.type}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">x</span>
                                                <Input type="number" min="0" placeholder="0" className="h-8 w-20 text-center font-medium" value={cashQuantities[key] || ""} onChange={(e) => handleCashChange(d.type, d.value, e.target.value)} />
                                            </div>
                                            <div className="w-24 text-right">
                                                <span className="text-sm font-bold text-foreground">₹ {subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-4 bg-muted/40 rounded-lg flex justify-between items-center border border-dashed border-border">
                                <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-muted-foreground" /><span className="font-bold uppercase text-xs tracking-widest text-muted-foreground">Total</span></div>
                                <span className="text-2xl font-black text-foreground">₹ {calculatedTotalCash.toLocaleString('en-IN')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Physical Items */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-foreground">4. Physical Items</h2>
                    {items.map((item, idx) => (
                        <div key={item.id} className="relative rounded-xl border bg-white p-6 shadow-sm">
                            <div className="absolute right-4 top-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1"><Label>Item Name <span className="text-red-500">*</span></Label><Input placeholder="e.g. Gold Chain" value={item.item_name} onChange={(e) => updateItem(idx, "item_name", e.target.value)} /></div>
                                <div className="space-y-1"><Label>Quantity (Count)</Label><Input type="number" placeholder="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} /></div>
                                <div className="space-y-1">
                                    <Label>Unit</Label>
                                    <Select value={item.unit} onValueChange={(val) => updateItem(idx, "unit", val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {unitList.map((u) => {
                                                const isStandard = ["gms", "kgs", "mg", "pcs", "Other"].includes(u.value);
                                                return (
                                                    <div key={u.value} className="flex items-center justify-between group px-1">
                                                        <SelectItem value={u.value} className="flex-1 capitalize">{u.label}</SelectItem>
                                                        {!isStandard && (
                                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteCustomUnit(u.value); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {item.unit === "Other" ? (
                                    <>
                                        <div className="space-y-1"><Label>Measurement Name</Label><Input placeholder="e.g. Litre" value={item.custom_unit} onChange={(e) => updateItem(idx, "custom_unit", e.target.value)} /></div>
                                        <div className="space-y-1"><Label>Weight / Value</Label><Input type="number" placeholder="e.g. 5.5" value={item.weight_value} onChange={(e) => updateItem(idx, "weight_value", e.target.value)} /></div>
                                    </>
                                ) : (
                                    <div className="space-y-1"><Label>Weight ({item.unit})</Label><Input type="number" placeholder="Enter weight" value={item.weight_value} onChange={(e) => updateItem(idx, "weight_value", e.target.value)} /></div>
                                )}
                                <div className="space-y-1"><Label>Est. Value (₹)</Label><Input type="number" placeholder="Price" value={item.estimated_value} onChange={(e) => updateItem(idx, "estimated_value", e.target.value)} /></div>
                                <div className="space-y-1 md:col-span-2"><Label>Description</Label><Textarea placeholder="Details..." value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="h-10 min-h-10" /></div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 mt-4"><Button onClick={addNewItemForm} variant="secondary"><Plus className="h-4 w-4 mr-2" /> Add Item</Button></div>
                </div>
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-foreground">5. Hundi Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="overflow-hidden bg-white shadow-sm border">
                            <CardContent className="p-4 flex flex-col items-center justify-center min-h-52 text-center space-y-3">
                                <h3 className="font-semibold text-lg">Hundi Witness</h3>
                                {witnessImg ? (
                                    <div className="relative w-full h-40 group">
                                        <img src={witnessImg.preview} alt="Witness" className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" onClick={() => setViewImage(witnessImg.preview)}><Eye className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="destructive" onClick={removeImage}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <Label htmlFor="upload-witness" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:bg-muted transition">
                                            {processingImgType === "Hundi Witness" ? <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" /> : <UploadCloud className="h-8 w-8 text-muted-foreground" />}
                                            <span className="text-xs text-muted-foreground mt-2">{processingImgType === "Hundi Witness" ? "Compressing..." : "Click to Upload"}</span>
                                            <Input id="upload-witness" type="file" accept="image/*" className="hidden" disabled={!!processingImgType} onChange={(e) => e.target.files && handleSpecificImageUpload(e.target.files[0])} />
                                        </Label>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 6. Final Verification */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold border-b pb-2 text-foreground">6. Final Verification</h2>
                    <Card className="bg-muted/20 border-border">
                        <CardHeader className="pb-2"><CardTitle className="text-lg font-medium text-foreground flex items-center gap-2"><Calculator className="h-5 w-5" /> Summary</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                            <div className="flex flex-col space-y-1 p-4 bg-background rounded-lg border shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium"><Wallet className="h-4 w-4" /> Total Cash</div>
                                <div className="text-2xl font-bold text-foreground">₹ {calculatedTotalCash.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex flex-col space-y-1 p-4 bg-background rounded-lg border shadow-sm">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium"><Package className="h-4 w-4" /> Items Value</div>
                                <div className="text-2xl font-bold text-foreground">₹ {calculatedTotalItems.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex flex-col space-y-1 p-4 bg-background rounded-lg border border-border shadow-sm">
                                <div className="flex items-center gap-2 text-foreground text-sm font-medium"><CheckCircle2 className="h-4 w-4" /> Grand Total</div>
                                <div className="text-3xl font-extrabold text-foreground">₹ {grandTotal.toLocaleString('en-IN')}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2"><Label className="text-base">General Remark</Label><Textarea placeholder="Any additional notes regarding this collection..." className="min-h-24" value={generalRemark} onChange={(e) => setGeneralRemark(e.target.value)} /></div>
                            <div className="mt-6 flex justify-end"><Button size="lg" onClick={handleReviewHundi} className="w-full md:w-auto bg-foreground text-background hover:bg-foreground/90">Review Hundi</Button></div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* PREVIEW & FINALIZE MODAL */}
            {previewData && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-background">
                        <div className="flex justify-between items-center border-b p-6 shrink-0">
                            <div className="flex items-center gap-2"><CheckCircle2 className="text-primary h-6 w-6" /><div><h2 className="text-2xl font-bold">{createdHundiId ? "Finalize Hundi" : "Final Hundi Summary"}</h2></div></div>
                            {!createdHundiId && <Button variant="ghost" size="icon" onClick={() => setPreviewData(null)}><X className="h-5 w-5" /></Button>}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {!createdHundiId ? (
                                <>
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Basic Details</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div className="p-3 bg-muted/30 rounded border"><span className="block text-xs text-muted-foreground">Opened At</span><span className="font-medium">{date ? format(date, "PPP") : ""} {time}</span></div>
                                            <div className="p-3 bg-muted/30 rounded border"><span className="block text-xs text-muted-foreground">Temple</span><span className="font-medium">{templesList.find(t => String(t.id) === selectedTemple)?.name}</span></div>
                                            <div className="p-3 bg-muted/30 rounded border col-span-2"><span className="block text-xs text-muted-foreground">Deities Included</span><span className="font-medium">{displayDeities}</span></div>
                                        </div>
                                    </section>
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Witnesses</h3>
                                        <div className="rounded-md border">
                                            <table className="w-full text-sm text-left"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">Designation</th><th className="p-3 font-medium">Phone</th></tr></thead><tbody>{witnesses.map((w, i) => (<tr key={i} className="border-t last:border-0"><td className="p-3">{w.name}</td><td className="p-3">{w.designation === "Other" ? w.custom_designation : w.designation}</td><td className="p-3">{w.phone}</td></tr>))}</tbody></table>
                                        </div>
                                    </section>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <section className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Cash Breakdown</h3>
                                            <div className="rounded-md border overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 font-medium">Type</th><th className="p-2 font-medium">Denom</th><th className="p-2 font-medium text-right">Qty</th><th className="p-2 font-medium text-right">Subtotal</th></tr></thead>
                                                    <tbody>
                                                        {CASH_DENOMINATIONS.map(d => {
                                                            const qty = Number(cashQuantities[`${d.type}_${d.value}`] || 0);
                                                            if (qty === 0) return null;
                                                            return (
                                                                <tr key={`${d.type}_${d.value}`} className="border-t last:border-0 hover:bg-muted/20">
                                                                    <td className="p-2"><span className={`text-[10px] font-bold uppercase ${d.type === 'note' ? 'text-blue-600' : 'text-orange-600'}`}>{d.type}</span></td>
                                                                    <td className="p-2 font-medium">{d.label}</td><td className="p-2 text-right">{qty}</td><td className="p-2 text-right font-bold">₹ {(qty * d.value).toLocaleString('en-IN')}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                        <tr className="border-t bg-muted/40 font-black text-lg"><td className="p-3" colSpan={3}>Total Cash Collection</td><td className="p-3 text-right">₹ {calculatedTotalCash.toLocaleString('en-IN')}</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                        <section className="space-y-3">
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Physical Items</h3>
                                            {items.length === 0 ? <p className="text-sm text-muted-foreground italic">No items recorded.</p> : (
                                                <div className="rounded-md border">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 font-medium">Item</th><th className="p-2 font-medium text-right">Est. Val</th></tr></thead>
                                                        <tbody>
                                                            {items.map((item, i) => (
                                                                <tr key={i} className="border-t last:border-0"><td className="p-2"><div>{item.item_name} <span className="text-muted-foreground text-xs">(Qty: {item.quantity})</span></div><div className="text-xs text-muted-foreground">{item.description}</div></td><td className="p-2 text-right">₹ {Number(item.estimated_value).toLocaleString('en-IN')}</td></tr>
                                                            ))}
                                                            <tr className="border-t bg-muted/20 font-bold"><td className="p-2">Total Value</td><td className="p-2 text-right">₹ {calculatedTotalItems.toLocaleString('en-IN')}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Images</h3>
                                        <div className="flex gap-4">{hundiImages.map(img => (<div key={img.name} className="border p-2 rounded bg-muted/10"><p className="text-xs font-medium mb-1 text-center">{img.name}</p><img src={img.preview} alt={img.name} className="h-24 w-auto object-cover rounded" /></div>))}</div>
                                    </section>
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Final Remark</h3>
                                        <div className="p-4 bg-muted/30 border rounded text-sm min-h-16">{generalRemark || "No remarks provided."}</div>
                                    </section>
                                </>
                            ) : (
                                <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95">
                                    <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200"><h3 className="font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Hundi Saved Successfully!</h3><p className="text-sm mt-1">Receipt Number: <strong>#{createdHundiId}</strong></p></div>
                                    <p className="text-muted-foreground text-sm">Print the document for witness verification, and optionally upload a scanned copy of the signed receipt below.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <Card className="w-full">
                                            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><Printer className="h-4 w-4" /> Print Hundi Report</CardTitle><CardDescription>Generate the official receipt for verification.</CardDescription></CardHeader>
                                            <CardContent><div className="rounded-md border bg-muted/20 p-3 text-sm space-y-2"><div className="flex justify-between"><span className="text-muted-foreground">Receipt No</span><span className="font-medium font-mono">#{createdHundiId}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-medium font-mono">₹ {grandTotal.toLocaleString('en-IN')}</span></div></div></CardContent>
                                            <CardFooter><Button onClick={handlePrint} variant="outline" className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Document</Button></CardFooter>
                                        </Card>
                                        <Card className="w-full">
                                            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold flex items-center gap-2"><FileUp className="h-4 w-4" /> Upload Signed Copy <span className="text-xs font-normal text-muted-foreground ml-2">(Optional)</span></CardTitle><CardDescription>Upload the stamped document (PDF or Image).</CardDescription></CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid w-full items-center gap-1.5"><Label htmlFor="file-upload">Document File</Label><Input id="file-upload" type="file" accept="application/pdf,image/*" onChange={handleSignatureUploadChange} className="cursor-pointer" /></div>
                                                {signatureFile && (
                                                    <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/40">{signatureFile.type.includes('pdf') ? <FileText className="h-8 w-8 text-red-500/80" /> : <ImageIcon className="h-8 w-8 text-blue-500/80" />}<div className="flex flex-col overflow-hidden"><span className="text-sm font-medium truncate w-48">{signatureFile.name}</span><span className="text-xs text-muted-foreground">{(signatureFile.size / 1024 / 1024).toFixed(2)} MB</span></div><CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" /></div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 border-t p-6 bg-muted/20 shrink-0">
                            {!createdHundiId ? (
                                <><Button variant="outline" onClick={() => setPreviewData(null)} disabled={isSubmitting}>Edit</Button><Button onClick={confirmAndSaveToDatabase} disabled={isSubmitting} className="min-w-37.5 bg-foreground text-background hover:bg-foreground/90">{isSubmitting ? "Saving..." : "Confirm & Save"}</Button></>
                            ) : (
                                <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="min-w-37.5 bg-foreground text-background hover:bg-foreground/90">{isSubmitting ? "Finishing..." : "Complete & Close"}</Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {/* PRINTABLE INVOICE VIEW */}
            {previewData && createdHundiId && (
                <div id="printable-invoice" className="hidden print:block bg-white text-black font-sans leading-relaxed">
                    <div className="max-w-[210mm] mx-auto p-12 min-h-[290mm] relative flex flex-col">
                        <div className="flex justify-between items-start border-b-4 border-double border-black pb-6 mb-8">
                            <div className="space-y-2"><h1 className="text-4xl font-extrabold uppercase tracking-tight">{templesList.find(t => String(t.id) === selectedTemple)?.name || "Temple Name"}</h1></div>
                            <div className="text-right"><div className="inline-block bg-gray-100 border border-gray-300 px-4 py-1 rounded-sm mb-2"><h2 className="text-lg font-bold uppercase text-gray-800 tracking-wide">Hundi Receipt</h2></div><p className="text-xs font-semibold text-gray-400 uppercase">System Generated</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-300 pb-1"><span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Receipt No</span><span className="font-bold text-base">#{createdHundiId}</span></div>
                                <div className="flex justify-between border-b border-gray-300 pb-1"><span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Deities</span><span className="font-medium text-base text-right max-w-[60%] whitespace-normal wrap-break-word leading-tight">{displayDeities}</span></div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-300 pb-1"><span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Date</span><span className="font-medium text-base">{format(new Date(), "dd MMM yyyy")}</span></div>
                                <div className="flex justify-between border-b border-gray-300 pb-1"><span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Opened At</span><span className="font-medium text-base">{date ? format(date, "dd MMM yyyy") : "-"}, {time}</span></div>
                            </div>
                        </div>
                        <div className="mb-8">
                            <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 tracking-widest">1. Cash Details</h3>
                            <table className="w-full text-sm border-collapse border border-gray-300">
                                <thead className="bg-gray-100"><tr><th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Type</th><th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Denomination</th><th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Count</th><th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Amount</th></tr></thead>
                                <tbody>
                                    {CASH_DENOMINATIONS.map((d, i) => { const qty = Number(cashQuantities[`${d.type}_${d.value}`] || 0); if (qty === 0) return null; return (<tr key={i}><td className="border border-gray-300 p-2 capitalize">{d.type}</td><td className="border border-gray-300 p-2 text-right">₹ {d.value}</td><td className="border border-gray-300 p-2 text-right">{qty}</td><td className="border border-gray-300 p-2 text-right font-mono font-medium">₹ {(d.value * qty).toLocaleString('en-IN')}</td></tr>) })}
                                    <tr className="bg-gray-50 font-bold"><td className="border border-gray-300 p-2 text-right text-gray-600" colSpan={3}>Total Cash</td><td className="border border-gray-300 p-2 text-right font-mono text-base">₹ {calculatedTotalCash.toLocaleString('en-IN')}</td></tr>
                                </tbody>
                            </table>
                        </div>
                        {items && items.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 tracking-widest">2. Physical Items</h3>
                                <table className="w-full text-sm border-collapse border border-gray-300">
                                    <thead className="bg-gray-100"><tr><th className="border border-gray-300 p-2 text-left font-bold text-gray-700 w-1/4">Item Name</th><th className="border border-gray-300 p-2 text-right font-bold text-gray-700 w-1/6">Qty</th><th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Description / Weight</th><th className="border border-gray-300 p-2 text-right font-bold text-gray-700 w-1/6">Est. Value</th></tr></thead>
                                    <tbody>
                                        {items.map((item, i) => (<tr key={i}><td className="border border-gray-300 p-2 font-medium">{item.item_name}</td><td className="border border-gray-300 p-2 text-right">{item.quantity} {item.unit}</td><td className="border border-gray-300 p-2 text-xs text-gray-600">{item.description}</td><td className="border border-gray-300 p-2 text-right font-mono font-medium">₹ {Number(item.estimated_value).toLocaleString('en-IN')}</td></tr>))}
                                        <tr className="bg-gray-50 font-bold"><td className="border border-gray-300 p-2 text-right text-gray-600" colSpan={3}>Total Items Value</td><td className="border border-gray-300 p-2 text-right font-mono text-base">₹ {calculatedTotalItems.toLocaleString('en-IN')}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/2 border-2 border-black p-5 bg-white shadow-sm"><div className="flex justify-between text-sm mb-2"><span className="text-gray-600 font-medium">Total Cash:</span><span className="font-medium font-mono">₹ {calculatedTotalCash.toLocaleString('en-IN')}</span></div><div className="flex justify-between text-sm mb-4"><span className="text-gray-600 font-medium">Items Value:</span><span className="font-medium font-mono">₹ {calculatedTotalItems.toLocaleString('en-IN')}</span></div><Separator className="bg-black my-2" /><div className="flex justify-between items-center pt-2"><span className="font-black text-lg uppercase tracking-tight">Grand Total</span><span className="font-black text-2xl font-mono">₹ {grandTotal.toLocaleString('en-IN')}</span></div></div>
                        </div>
                        {generalRemark && (<div className="mb-10 p-4 border border-dashed border-gray-400 rounded-sm bg-gray-50/50"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</p><p className="text-sm text-gray-800 font-medium">{generalRemark}</p></div>)}
                        <div className="mt-auto"><div className="flex justify-end mt-12"><div className="text-center"><div className="w-64 border-b-2 border-black mb-3"></div><p className="font-bold text-sm uppercase tracking-wider">Signature</p></div></div><div className="text-center text-[10px] text-gray-400 mt-10 pt-4 border-t border-gray-200">This is a computer generated document • {format(new Date(), "PPP p")}</div></div>
                    </div>
                </div>
            )}

            {viewImage && (<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setViewImage(null)}><div className="relative max-w-4xl w-full h-auto"><img src={viewImage} alt="Preview" className="w-full max-h-[90vh] object-contain rounded shadow-2xl" /><Button variant="secondary" size="icon" className="absolute top-4 right-4 rounded-full" onClick={() => setViewImage(null)}><X className="h-6 w-6" /></Button></div></div>)}
        </div>
    )
}