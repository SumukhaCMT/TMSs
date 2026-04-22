

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function DateSearch({ onSearch, onDownload }) {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [error, setError] = useState(""); // ✅ like login validation

  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("");

  // ✅ SEARCH VALIDATION (like login)
  const handleSearch = () => {
    if (!fromDate || !toDate) {
      setError("Both dates are required");
      return;
    }

    if (fromDate > toDate) {
      setError("From Date cannot be after To Date");
      return;
    }

    setError("");
    onSearch?.(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setError("");
    onSearch?.("", "");
  };

  const handleDownload = () => {
    if (!fromDate || !toDate) {
      setError("Select date range before download");
      return;
    }
    setOpen(true);
  };

  const confirmDownload = () => {
    if (!format) {
      setError("Please select format");
      return;
    }

    setError("");

    onDownload?.({
      fromDate,
      toDate,
      format,
    });

    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-lg shadow-sm border">
        
        {/* From Date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">From Date</label>
          <Input
            type="date"
            value={fromDate}
            max={today}   // ✅ no future date
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">To Date</label>
          <Input
            type="date"
            value={toDate}
            min={fromDate || ""} // ✅ cannot be less than fromDate
            max={today}          // ✅ no future date
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <Button onClick={handleSearch} className="600 text-white">
          Search
        </Button>

        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>

        <Button
          onClick={handleDownload}
          className="600 text-white"
        >
          Download
        </Button>
      </div>

      {/* ✅ ERROR MESSAGE (like login form) */}
      {error && (
        <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>
      )}

      {/* ✅ Download Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Format</DialogTitle>
            <DialogDescription>
              Choose the format you want to download
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDownload}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DateSearch;