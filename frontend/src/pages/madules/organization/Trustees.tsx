import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchTrustees,
  deleteTrustee
} from "@/features/trustees/trusteesThunks"
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

export default function Trustees() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const { trustees, loading } = useAppSelector(
    (state: any) => state.trustees
  )

  //  Fetch trustees on load
  useEffect(() => {
    dispatch(fetchTrustees())
  }, [dispatch])

  //  Open delete confirmation dialog
  const handleDelete = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }

  //  Confirm delete
  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deleteTrustee(selectedRow.id)).unwrap()

      toast.success("Trustee deleted successfully")

      setOpen(false)
      setSelectedRow(null)

    } catch (err: any) {
      toast.error(err?.message || "Failed to delete Trustee")
    }
  }

  return (
    <>
      {/*  Breadcrumb */}
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Trustees" },
          { label: "Create Trustee", to: "/organizations/addtrustees" },
        ]}
      />

      {/*  Data Table */}
      <DataTable
        title="Trustees"
        data={trustees}
        loading={loading}
        onAdd={() => navigate("/organizations/addtrustees")}
        onEdit={(row) => navigate(`/organizations/trustees/${row.id}/edit`)}
        onDelete={handleDelete}
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "position", label: "Position" },
          { key: "city", label: "City" },

          //  Better UI for status
          {
            key: "status",
            label: "Status",
            render: (row: any) => (
              <span
                className={
                  row.status === "active"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {row.status}
              </span>
            ),
          },
        ]}
      />

      {/*  DELETE CONFIRM DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trustee</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
