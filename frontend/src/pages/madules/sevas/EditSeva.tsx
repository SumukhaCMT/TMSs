import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { validateSevaForm } from "@/utils/validateSevaForm"

import { toast } from "sonner"
import { secureStorage } from "@/utils/secureStorage"

export default function EditSeva() {

  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) {
      fetchSeva()
    }
  }, [id])

  // FETCH SINGLE SEVA
  const fetchSeva = async () => {

    try {

      const token = secureStorage.getItem("token")

      const res = await axios.get(
        `https://tmscmt.netlify.appapi/v1/temple/sevas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setData(res.data.data)

    } catch (err: any) {

      setError(
        err.response?.data?.message || "Failed to load seva"
      )

    } finally {

      setLoading(false)

    }
  }

  // UPDATE SEVA
  const handleSubmit = async (formData: any) => {

    setErrors({})
    setError("")

    const validationErrors = validateSevaForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const token = secureStorage.getItem("token")

      await axios.put(
        `https://tmscmt.netlify.appapi/v1/temple/sevas/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success("Seva Updated Successfully")

      // redirect after short delay
      setTimeout(() => {
        navigate("/sevas")
      }, 1000)

    } catch (err: any) {

      let backendMessage =
        err.response?.data?.message || "Update failed"

      if (backendMessage.includes("unique_seva_name")) {
        backendMessage = "A Seva with this name already exists."
      }

      toast.error(backendMessage)

    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Loading Seva...</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Sevas", to: "/sevas" },
          { label: "Edit Seva" },
        ]}
      />

      <FormBuilder
        title="Edit Seva"
        submitLabel="Update"
        defaultValues={data || {}}
        onSubmit={handleSubmit}
        errors={errors}
        fields={[
          {
            name: "seva_name",
            label: "Seva Name",
            required: true,
            placeholder: "Enter a unique name for the seva"
          },
          {
            name: "amount",
            label: "Amount",
            type: "number",
            required: true,
            placeholder: "Enter the amount for the seva"
          },
          {
            name: "display_order",
            label: "Display Order",
            type: "number",
            placeholder: "Enter display order"
          },
          {
            name: "is_default",
            label: "Default",
            type: "select",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
          {
            name: "is_recurring",
            label: "Recurring",
            type: "select",
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
          {
            name: "recurring_interval",
            label: "Recurring Interval",
            type: "select",
            options: [
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ],
          },
          {
            name: "recurring_count",
            label: "Recurring Count",
            type: "number",
            placeholder: "Number of recurring times"
          },
          {
            name: "remark",
            label: "Remark",
            type: "textarea",
            placeholder: "Additional notes",
            colSpan: 4,
          },
        ]}
      />
    </>
  )
}