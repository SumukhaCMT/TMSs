
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validatePaymentMethodForm } from "@/utils/validatePaymentMethodForm"
import { useAppDispatch } from "@/app/hooks"
import { addPaymentMethod } from "@/features/paymentmethod/paymentMethodThunks"
import { toast } from "sonner"

export default function AddPaymentMethod() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (data: any) => {
    // 1 Validate
    const validationErrors = validatePaymentMethodForm(data)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // 2 Dispatch thunk
      await dispatch(addPaymentMethod(data)).unwrap()

      // 3 Success
      toast.success("Payment Method Added Successfully")
      navigate("/payment-methods")
    } catch (err: any) {
      // 4 Handle backend errors
      const message =
        err?.message || err?.data?.message || "Failed to create Payment Method"
      toast.error(message)
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Payment Methods", to: "/payment-methods" },
          { label: "Add Payment Method" },
        ]}
      />

      <FormBuilder
        title="Add Payment Method"
        submitLabel="Save"
        onSubmit={handleSubmit}
        defaultValues={{ is_default: "no", display_order: 1 }}
        errors={errors}
        fields={[
          { name: "payment_method", label: "Payment Method", required: true, placeholder: "Enter the name of the payment method" },
          { name: "display_order", label: "Display Order", type: "number", required: true, placeholder: "Enter the display order (numeric value)" },
          { name: "payment_method_type", label: "Payment Method Type", type: "search-select", required: true, options: [{ label: "Online", value: "online" }, { label: "Offline", value: "offline" }] },
          { name: "is_default", label: "Default", type: "search-select", required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
          { name: "remarks", label: "Remarks", type: "textarea", colSpan: 4, placeholder: "Additional notes about the payment method" },
        ]}
      />
    </>
  )
}