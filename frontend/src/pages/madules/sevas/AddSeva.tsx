import { useState } from "react"
import { useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validateSevaForm } from "@/utils/validateSevaForm"

import { useAppDispatch } from "@/app/hooks" 
import { addSeva } from "@/features/seva/sevaThunks"
import { toast } from "sonner"

export default function AddSeva() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (data: any) => {
  const validationErrors = validateSevaForm(data)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }

  try {
    await dispatch(addSeva(data)).unwrap()
    toast.success("Seva Added Successfully")
    navigate("/sevas")

  } catch (err: any) {
    // err could be a rejected payload from thunk or an AxiosError
    let message = "Failed to create Seva"

    // Thunk returns the axios response in err?.response sometimes
    if (err?.response?.data?.message) {
      message = err.response.data.message
    }
    // For rejectedWithValue in thunk, err might have a message property
    else if (err?.message) {
      message = err.message
    }

    toast.error(message)
  }
}

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Sevas", to: "/sevas" },
          { label: "Add Seva" }
        ]}
      />

      <FormBuilder
      
        title="Add Seva"
        submitLabel="Save"
         backPath="/sevas"
        errors={errors}
        onSubmit={handleSubmit}
        defaultValues={{
          is_default: "no",
          is_recurring: "no",
          recurring_count: 0,
          display_order: 1
        }}
        fields={[
          { name: "seva_name", label: "Seva Name", placeholder: "Enter Seva Name", required: true },
          { name: "amount", label: "Amount", type: "number", required: true, placeholder: "Enter the amount for the seva" },
          { name: "display_order", label: "Display Order", type: "number", required: true, placeholder: "Enter the display order (numeric value)"   },
          { name: "recurring_count", label: "Count", type: "number", placeholder: "Enter recurring count" },
          {
            name: "is_default",
            label: "Default",
            // type: "select",
             type: "search-select",
              placeholder: "Is this the default seva?",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]
          },
          {
            name: "is_recurring",
            label: "Recurring",
            // type: "select",
             type: "search-select",
              placeholder: "Is this a recurring seva?",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" }
            ]
          },
          {
            name: "recurring_interval",
            label: "Interval",
            type: "search-select",
              placeholder: "Select the recurring interval",
            options: [
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" }
            ]
          },
          { name: "remarks", label: "Remarks", type: "textarea", colSpan: 4, placeholder: "Additional details about the Seva" }
        ]}
      />
    </>
  )
}