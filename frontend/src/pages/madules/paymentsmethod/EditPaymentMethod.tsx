
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validatePaymentMethodForm } from "@/utils/validatePaymentMethodForm"
import api from "@/axios/axios"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export default function EditPaymentMethod() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  const [open, setOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(true)

  useEffect(() => {
    if (id) fetchPaymentMethod()
  }, [id])

  // ================= FETCH =================
  const fetchPaymentMethod = async () => {
    try {
      const res = await api.get(
        `/v1/temple/payment-methods/${id}`
      )

      setData(res.data.data)

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load payment method"
      )
    } finally {
      setLoading(false)
    }
  }

  // ================= UPDATE =================
  const handleSubmit = async (formData: any) => {

    setErrors({})
    setError("")

    const validationErrors = validatePaymentMethodForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await api.put(
        `/v1/temple/payment-methods/${id}`,
        formData
      )

      setIsSuccess(true)
      setDialogMessage("Payment Method Updated Successfully")
      setOpen(true)

    } catch (err: any) {

      let backendMessage =
        err.response?.data?.message || "Update failed"

      if (backendMessage.includes("uk_temple_payment_method")) {
        backendMessage = "This Payment Method already exists."
      }

      setIsSuccess(false)
      setDialogMessage(backendMessage)
      setOpen(true)
    }
  }

  if (loading) return <>Loading...</>

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Payment Methods", to: "/payment-methods" },
          { label: "Edit Payment Method" }
        ]}
      />

      <FormBuilder
        title="Edit Payment Method"
        submitLabel="Update"
        defaultValues={data}
        onSubmit={handleSubmit}
        errors={errors}
        fields={[
          {
            name: "payment_method",
            label: "Payment Method",
            required: true,
            placeholder: "Enter the name of the payment method"
          },
          {
            name: "display_order",
            label: "Display Order",
            type: "number",
            placeholder: "Enter the display order (numeric value)",
          },
          {
            name: "payment_method_type",
            label: "Payment Method Type",
            type: "search-select",
            required: true,
            placeholder: "Select the payment method type",
            options: [
              { label: "Online", value: "online" },
              { label: "Offline", value: "offline" }
              
            ]
          },
          {
            name: "is_default",
            label: "Default",
            type: "search-select",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]
          },
          {
            name: "status",
            label: "Status",
            type: "search-select",
            placeholder: "Select the status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Expired", value: "expired" },
              { label: "Cancelled", value: "cancelled" }
            ]
          },
          {
            name: "remark",
            label: "Remark",
            type: "textarea",
            colSpan: 4,
            placeholder: "Enter any additional remarks about the payment method (optional)",
          }
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={isSuccess ? "text-green-600" : "text-red-600"}
            >
              {dialogMessage}
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => {
                setOpen(false)
                if (isSuccess) {
                  navigate("/payment-methods")
                }
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}