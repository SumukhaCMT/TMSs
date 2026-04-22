import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Loader2,
  Printer,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  FileUp
} from "lucide-react";
import { toast } from "sonner";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Custom Imports
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import api from "@/axios/axios";

// --- Types ---
interface HundiWitness { name: string; designation: string; phone: string; }
interface HundiDenomination { denomination_type: string; denomination_value: number; quantity: number; }
interface HundiItem { item_name: string; quantity: number; unit: string; description: string; estimated_value: number; }

interface Temple {
  id: number;
  name: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

interface Deity {
  id: number;
  name: string;
}

interface HundiData {
  id: number;
  temple_id: number;
  organization_id: number;
  deity_id?: number;
  opened_at: string;
  total_amount: number;
  total_items_value: number;
  witnesses: HundiWitness[];
  denominations: HundiDenomination[];
  items: HundiItem[];
  remark: string;
}

export default function HundiFinalize() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<HundiData | null>(null);
  const [temple, setTemple] = useState<Temple | null>(null);
  const [deityName, setDeityName] = useState<string>("-");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/v1/hundi/${id}`);
        if (res.data?.success) {
          const hundiData = res.data.data;
          setData(hundiData);

          // Fetch Temple Details
          if (hundiData.temple_id) {
            try {
              const templeRes = await api.get(`/v1/organizations/${hundiData.organization_id}/temples`);
              // Ensure backend returns full temple object with address fields
              const t = templeRes.data?.data?.find((tmpl: Temple) => tmpl.id === hundiData.temple_id);
              if (t) setTemple(t);
            } catch (error) { console.error("Could not fetch temple details", error); }
          }

          // Fetch Deity Name
          if (hundiData.deity_id) {
            try {
              const deityRes = await api.get('/v1/temple/deities');
              const d = deityRes.data?.data?.find((dt: Deity) => dt.id === hundiData.deity_id);
              if (d) setDeityName(d.name);
            } catch (error) { console.error("Could not fetch deity details", error); }
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load hundi details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Handlers
  const handlePrint = () => window.print();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return toast.error("File size must be under 5MB");
      setSignatureFile(file);
    }
  };

  const handleFinalSubmit = async () => {
    if (!signatureFile) return toast.error("Please upload the signed document first.");
    setUploading(true);
    const formData = new FormData();
    formData.append("signature_img", signatureFile);

    try {
      await api.put(`/v1/hundi/${id}/finalize`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Submission Completed Successfully!");
      navigate("/hundi");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload signature.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!data) return <div className="p-8 text-center text-red-500">Error: Could not load Hundi data.</div>;

  const grandTotal = Number(data.total_amount) + Number(data.total_items_value);
  const formattedDate = data.opened_at ? format(new Date(data.opened_at), "dd MMM yyyy, hh:mm a") : "-";

  // Construct Address String safely
  const addressParts = [
    temple?.address_line1,
    temple?.address_line2,
    temple?.city,
    temple?.state ? `${temple.state}${temple.pincode ? ' - ' + temple.pincode : ''}` : temple?.pincode
  ].filter(Boolean);

  return (
    <div className="w-full pb-10">

      {/* 🔴 PRINT CSS */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background: white;
            }
            @page { margin: 5mm; size: auto; }
            @page { margin-top: 0; margin-bottom: 0; }
          }
        `}
      </style>

      {/* ======================= SCREEN VIEW (UI) ======================= */}
      <div className="print:hidden flex flex-col gap-6">
        <AppBreadcrumb items={[{ label: "Hundi", to: "/hundi" }, { label: "Signature" }]} />

        <div className="flex flex-col gap-1 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Signature</h1>
          <p className="text-muted-foreground text-sm">Print the invoice, obtain signature, and upload the signed copy.</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* 1. Print Card */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print Hundi Report
              </CardTitle>
              <CardDescription>
                Generate the official receipt for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-muted/20 p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt No</span>
                  <span className="font-medium font-mono">#{id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium font-mono">₹ {grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePrint} variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" /> Print Document
              </Button>
            </CardFooter>
          </Card>

          {/* 2. Upload Card */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileUp className="h-4 w-4" /> Upload Signed Copy
              </CardTitle>
              <CardDescription>
                Upload the stamped document (PDF or Image).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="file-upload">Document File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>

              {/* File Preview */}
              {signatureFile && (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/40">
                  {signatureFile.type.includes('pdf') ? (
                    <FileText className="h-8 w-8 text-red-500/80" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-blue-500/80" />
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate w-48">{signatureFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(signatureFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleFinalSubmit}
                disabled={uploading || !signatureFile}
                className="w-full"
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Submission"}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>

      {/* ======================= PRINT VIEW (INVOICE) ======================= */}
      <div id="printable-invoice" className="hidden print:block bg-white text-black font-sans leading-relaxed">
        <div className="max-w-[210mm] mx-auto p-12 min-h-[290mm] relative flex flex-col">

          {/* --- INVOICE HEADER --- */}
          <div className="flex justify-between items-start border-b-4 border-double border-black pb-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold uppercase tracking-tight">{temple?.name || "Temple Name"}</h1>

              {/* Correctly Formatted Address Block */}
              <div className="text-sm text-gray-600 font-medium">
                {addressParts.length > 0 ? (
                  addressParts.map((part, index) => (
                    <p key={index} className="leading-snug">{part}</p>
                  ))
                ) : (
                  <p className="italic text-gray-400">Address not available</p>
                )}
                {temple?.phone && <p className="mt-1">Phone: {temple?.phone}</p>}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-gray-100 border border-gray-300 px-4 py-1 rounded-sm mb-2">
                <h2 className="text-lg font-bold uppercase text-gray-800 tracking-wide">Hundi Report</h2>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase">System Generated</p>
            </div>
          </div>

          {/* --- METADATA GRID --- */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Report No</span>
                <span className="font-bold text-base">#{data.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Deity</span>
                <span className="font-medium text-base">{deityName}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Date</span>
                <span className="font-medium text-base">{format(new Date(), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="font-bold text-gray-600 uppercase text-xs tracking-wider">Opened At</span>
                <span className="font-medium text-base">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* --- 1. CASH TABLE --- */}
          <div className="mb-8">
            <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 tracking-widest">1. Cash Details</h3>
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Type</th>
                  <th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Denomination</th>
                  <th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Count</th>
                  <th className="border border-gray-300 p-2 text-right font-bold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.denominations?.map((d, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2 capitalize">{d.denomination_type}</td>
                    <td className="border border-gray-300 p-2 text-right">₹ {d.denomination_value}</td>
                    <td className="border border-gray-300 p-2 text-right">{d.quantity}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono font-medium">₹ {(d.denomination_value * d.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-gray-300 p-2 text-right text-gray-600" colSpan={3}>Total Cash</td>
                  <td className="border border-gray-300 p-2 text-right font-mono text-base">₹ {Number(data.total_amount).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* --- 2. ITEMS TABLE --- */}
          {data.items && data.items.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-2 tracking-widest">2. Physical Items</h3>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left font-bold text-gray-700 w-1/4">Item Name</th>
                    <th className="border border-gray-300 p-2 text-right font-bold text-gray-700 w-1/6">Qty</th>
                    <th className="border border-gray-300 p-2 text-left font-bold text-gray-700">Description / Weight</th>
                    <th className="border border-gray-300 p-2 text-right font-bold text-gray-700 w-1/6">Est. Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 p-2 font-medium">{item.item_name}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="border border-gray-300 p-2 text-xs text-gray-600">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right font-mono font-medium">₹ {Number(item.estimated_value).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-300 p-2 text-right text-gray-600" colSpan={3}>Total Items Value</td>
                    <td className="border border-gray-300 p-2 text-right font-mono text-base">₹ {Number(data.total_items_value).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* --- SUMMARY BOX --- */}
          <div className="flex justify-end mb-12">
            <div className="w-1/2 border-2 border-black p-5 bg-white shadow-sm">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Total Cash:</span>
                <span className="font-medium font-mono">₹ {Number(data.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-600 font-medium">Items Value:</span>
                <span className="font-medium font-mono">₹ {Number(data.total_items_value).toLocaleString('en-IN')}</span>
              </div>
              <Separator className="bg-black my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-black text-lg uppercase tracking-tight">Grand Total</span>
                <span className="font-black text-2xl font-mono">₹ {grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* --- REMARKS --- */}
          {data.remark && (
            <div className="mb-10 p-4 border border-dashed border-gray-400 rounded-sm bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remarks</p>
              <p className="text-sm text-gray-800 font-medium">{data.remark}</p>
            </div>
          )}

          {/* --- SIGNATURES --- */}
          <div className="mt-auto">
            <div className="flex justify-end mt-12">
              <div className="text-center">
                <div className="w-64 border-b-2 border-black mb-3"></div>
                <p className="font-bold text-sm uppercase tracking-wider">Signature</p>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-400 mt-10 pt-4 border-t border-gray-200">
              This is a computer generated document • {format(new Date(), "PPP p")}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}