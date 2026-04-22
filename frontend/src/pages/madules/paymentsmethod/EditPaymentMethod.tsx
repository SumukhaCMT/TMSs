


import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { validatePaymentMethodForm } from "@/utils/validatePaymentMethodForm"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { secureStorage } from "@/utils/secureStorage"

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
    if (id) {
      fetchPaymentMethod()
    }
  }, [id])

  //  FETCH
  const fetchPaymentMethod = async () => {
    try {
      const token = secureStorage.getItem("token")

      const res = await axios.get(
        `http://localhost:5000/api/v1/temple/payment-methods/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  //  UPDATE
  const handleSubmit = async (formData: any) => {

    setErrors({})
    setError("")

    //  VALIDATION
    const validationErrors = validatePaymentMethodForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const token = secureStorage.getItem("token")

      await axios.put(
        `http://localhost:5000/api/v1/temple/payment-methods/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setIsSuccess(true)
      setDialogMessage("Payment Method Updated Successfully")
      setOpen(true)

    } catch (err: any) {

      let backendMessage =
        err.response?.data?.message || "Update failed"

      //  Duplicate DB error handling
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
            placeholder : "Enter the name of the payment method"
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
            type: "select",
            required: true,
            options: [
              { label: "online", value: "online" },
              { label: "offline", value: "offline" }
            ]
          },
          {
            name: "is_default",
            label: "Default",
            type: "select",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]
          },
          {
            name: "status",
            label: "Status",
            type: "select",
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
            placeholder: "Additional notes about the payment method"
          }
        ]}
      />

      {/*  STATUS POPUP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle
              className={
                isSuccess ? "text-green-600" : "text-red-600"
              }
            >
              {isSuccess ? " " : " "}
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