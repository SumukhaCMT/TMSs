

import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchSevaBookings,
  deleteSevaBooking,
  cancelSevaBooking,
} from "@/features/sevabooking/sevabookingThunks"

import { toast } from "sonner"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { RootState } from "@/app/store"
import DateSearch from "@/components/common/DateSreach"
import { downloadPDF, downloadExcel ,downloadCSV} from "@/utils/download";

export default function SevaBookingTable() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { sevaBookings, loading } = useAppSelector(
    (state: RootState) => state.sevabookings
  )

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const [reason, setReason] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    dispatch(fetchSevaBookings())
  }, [dispatch])

  //  DELETE
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await dispatch(deleteSevaBooking(selectedRow.id)).unwrap()
      toast.success("Deleted successfully ")
      setDeleteOpen(false)
    } catch (err: any) {
      toast.error(err || "Delete failed ")
    }
  }

  // 🟡 CANCEL
  const handleCancelClick = (row: any) => {
    setSelectedRow(row)
    setCancelOpen(true)
  }

  const confirmCancel = async () => {
    if (!reason) {
      toast.warning("Reason required ")
      return
    }

    try {
      await dispatch(
        cancelSevaBooking({
          id: selectedRow.id,
          data: {
            remark: reason,
            scheduled_date: date || null,
          },
        })
      ).unwrap()

      toast.success("Booking updated ")

      setCancelOpen(false)
      setReason("")
      setDate("")
    } catch (err: any) {
      toast.error(err || "Update failed ")
    }
  }

  return (
    < >
    <div className="p-4 space-y-4">
      <AppBreadcrumb 
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Seva Booking List" },
          { label: "Add Seva Booking", to: "/seva-booking/add" },
        ]}
      />
    <DateSearch
  onSearch={(from, to) => {
    dispatch(fetchSevaBookings({ from, to }));
  }}
  onDownload={({ format }) => {
    if (format === "pdf") {
      downloadPDF(sevaBookings);
    }

    if (format === "excel") {
      downloadExcel(sevaBookings);
    }
    if(format === "csv"){
      downloadCSV(sevaBookings);
    }
  }}
/>
      <DataTable
      
        title="Seva Bookings"
        data={sevaBookings}
        loading={loading}
        onAdd={() => navigate("/seva-booking/add")}
        onEdit={(row) => navigate(`/seva-booking/${row.id}/edit`)}
        onDelete={handleDeleteClick}
        onCancle={handleCancelClick}
        onView={(row) => navigate(`/seva-booking/${row.id}/print`)}
        columns={[
          { key: "seva_name", label: "Seva Name" },
          { key: "seva_amount", label: "Amount" },
          { key: "is_recurring", label: "Recurring" },
          { key: "recurring_interval", label: "Interval" },
          { key: "status", label: "Status" },
        ]}
      />
</div>
      {/*  DELETE DIALOG */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🟡 CANCEL DIALOG */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel / Reschedule</DialogTitle>
            {/*  ADD THIS */}
            <DialogDescription>
              Provide reason and optional new date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <textarea
              className="w-full border rounded p-2"
              placeholder="Enter reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={confirmCancel}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}