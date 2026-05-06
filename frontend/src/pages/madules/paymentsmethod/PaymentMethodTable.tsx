import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import DataTable from "@/components/common/DataTable"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  fetchPaymentMethods,
  deletePaymentMethod,
} from "@/features/paymentmethod/paymentMethodThunks"

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

export default function PaymentMethodTable() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { paymentmethod } = useAppSelector((state) => state.paymentMethod)

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)

  // Fetch payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Use the correct thunk
        const res: any = await dispatch(fetchPaymentMethods()).unwrap()
        setData(res || [])
      } catch (err: any) {
        toast.error(err?.message || "Failed to fetch Payment Methods")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dispatch])

  // Open delete confirmation dialog
  const handleDeleteClick = (row: any) => {
    setSelectedRow(row)
    setOpen(true)
  }

  // Confirm deletion
  const confirmDelete = async () => {
    if (!selectedRow) return

    try {
      await dispatch(deletePaymentMethod(selectedRow.id)).unwrap()
      toast.success("Payment Method deleted successfully")
      setData(data.filter((d) => d.id !== selectedRow.id)) // remove from table
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete Payment Method")
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Payment Methods List" },
          // { label: "Add Payment Method", to: "/payment-methods/add" },
        ]}
      />

      <DataTable
        title="Payment Methods"
        data={data}
        loading={loading}
          addLabel="Add Payment Method"
        
        onAdd={() => navigate("/payment-methods/add")}
        onEdit={(row) => navigate(`/payment-methods/${row.id}/edit`)}
        onDelete={handleDeleteClick}
        columns={[
          { key: "payment_method", label: "Payment Method" },
          { key: "payment_method_type", label: "Payment Method Type" },
          { key: "display_order", label: "Display Order" },
          { key: "is_default", label: "Default" },
          { key: "status", label: "Status" },
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