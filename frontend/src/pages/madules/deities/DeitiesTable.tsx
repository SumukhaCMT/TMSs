

import DataTable from "@/components/common/DataTable"
import type { Deities } from "@/types/Deities"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchDeities, deleteDeity } from "@/features/deities/deitiesThunk"

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

export default function DeitiesTable() {

  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  // ✅ get data from redux
  const { deities, loading } = useAppSelector((state) => state.deities)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Deities | null>(null)

  useEffect(() => {
    dispatch(fetchDeities())
  }, [dispatch])

  // OPEN DELETE DIALOG
  const handleDeleteClick = (row: Deities) => {
    setSelectedRow(row)
    setOpen(true)
  }

  // CONFIRM DELETE
  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deleteDeity(selectedRow.id)).unwrap()
      toast.success("Deity deleted successfully")
      setOpen(false)
    } catch (error) {
      toast.error("Failed to delete deity")
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Deities List" },
          // { label: "Add Deities", to: "/deities/add" },
        ]}
      />

      <DataTable<Deities>
        data={deities}
         addLabel="Add Deity"
         onAdd={() => navigate("/deities/add")}
        loading={loading}
        storageKey="deity_columns"
        columns={[
          { key: "name", label: "Deity Name" },
          { key: "code", label: "Code" },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (d) => (
              <span
                className={`rounded px-2 py-1 text-xs ${
                  d.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {d.status}
              </span>
            ),
          },
        ]}
         onAdd={() => navigate("/deities/add")}
        onEdit={(row) => navigate(`/deities/${row.id}/edit`)}
        onDelete={handleDeleteClick}
      />

      {/* DELETE DIALOG */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter >
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}