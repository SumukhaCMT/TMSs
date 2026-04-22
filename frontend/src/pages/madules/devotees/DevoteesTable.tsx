import DataTable from "@/components/common/DataTable"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchDevotees, deleteDevotee } from "@/features/devotees/devoteesThunks"
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

export default function DevoteesTable() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { devotees, loading } = useAppSelector((state) => state.devotees)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchDevotees())
  }, [dispatch])

  const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deleteDevotee(selectedRow.id)).unwrap()
      toast.success("Devotee deleted successfully")
      setOpen(false)
    } catch (error: any) {
      toast.error(error || "Failed to delete")
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Devotees List" },
          { label: "Add Devotee", to: "/devotees/add" },
        ]}
      />

      <DataTable
        data={devotees}   // ✅ FIXED (was wrong state)
        loading={loading}
        storageKey="devotees"
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "gender", label: "Gender" },
          { key: "city", label: "City" },
          { key: "status", label: "Status" },
        ]}
        onEdit={(row) => navigate(`/devotees/${row.id}/edit`)}
        onDelete={handleDeleteClick}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
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