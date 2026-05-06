


import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSevas, deleteSeva } from "@/features/seva/sevaThunks"

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

export default function SevasTable() {

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { sevas } = useAppSelector((state) => state.seva)

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  // Fetch sevas
  useEffect(() => {
    dispatch(fetchSevas())
  }, [dispatch])

  // Open delete popup
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {

    if (!selectedRow) return

    try {

      await dispatch(deleteSeva(selectedRow.id)).unwrap()

      toast.success("Seva deleted successfully")

      setOpen(false)

    } catch (error: any) {

      toast.error(error?.message || "Failed to delete Seva")

    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Sevas List" },
          // { label: "Add Sevas", to: "/sevas/add" },
        ]}
      />

      <DataTable
        title="Sevas"
        data={sevas}
         addLabel="Add Seva"
        onAdd={() => navigate("/sevas/add")}
        // onEdit={(row) => navigate(`/sevas/${row.id}/edit`)}
        onEdit={(row) => {
          if (!row?.id) return
          navigate(`/sevas/${row.id}/edit`)
        }}
        onDelete={handleDeleteClick}
        columns={[
          { key: "seva_name", label: "Seva Name" },
          { key: "amount", label: "Amount" },
          { key: "display_order", label: "Display Order" },
          { key: "is_default", label: "Default" },
          { key: "is_recurring", label: "Recurring" },
          { key: "recurring_interval", label: "Interval" },
        ]}
      />

      {/* DELETE CONFIRM POPUP */}

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