import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchTemples, deleteTemple } from "@/features/temples/templesThunks"

import { toast } from "sonner"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export default function TemplesTable() {

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { temples, loading } = useAppSelector((state) => state.temples)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  // 🔹 Fetch temples
  useEffect(() => {
    dispatch(fetchTemples())
  }, [dispatch])

  // 🔹 Format location (optional but better UI)
  const formattedTemples = temples.map((t: any) => ({
    ...t,
    location: [t.city, t.state, t.country].filter(Boolean).join(", "),
  }))

  // 🔹 Open delete popup
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }

  // 🔹 Confirm delete
  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deleteTemple(selectedRow.id)).unwrap()
      toast.success("Temple deleted successfully")
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete Temple")
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Temples List" },
          { label: "Add Temple", to: "/temples/add" },
        ]}
      />

      <DataTable
        title="Temples"
        data={formattedTemples}
        loading={loading}
        onAdd={() => navigate("/temples/add")}
        onEdit={(row) => {
          if (!row?.id) return
          navigate(`/temples/${row.id}/edit`)
        }}
        onDelete={handleDeleteClick}
        columns={[
          { key: "name", label: "Temple Name" },
          { key: "location", label: "Location" }, // ✅ fixed
          { key: "phone", label: "Phone" },
          { key: "status", label: "Status" },
        ]}
      />

      {/* 🔴 DELETE CONFIRM POPUP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Temple</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button variant="destructive" onClick={confirmDelete}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}