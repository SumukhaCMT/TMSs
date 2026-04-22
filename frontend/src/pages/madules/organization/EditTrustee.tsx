


import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { validateTrustees } from "@/utils/validateTrustees"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { secureStorage } from "@/utils/secureStorage"

export default function EditTrustee() {

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
      fetchTrustee()
    }
  }, [id])

  //  FETCH
  const fetchTrustee = async () => {
    try {
      const token = secureStorage.getItem("token")

      const res = await axios.get(
        `http://localhost:5000/api/v1/temple/trustees/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setData(res.data.data)

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load trustee"
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
    const validationErrors = validateTrustees(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const token = secureStorage.getItem("token")

      await axios.put(
        `http://localhost:5000/api/v1/temple/trustees/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setIsSuccess(true)
      setDialogMessage("Trustee Updated Successfully")
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
            name: "name",
            label: "Name",
            required: true,
            placeholder : "Enter the name of the trustee"
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            required: true,
            placeholder : "Enter the email of the trustee"
          },
          {
            name: "phone",
            label: "Phone",
            type: "number",
            required: true,
            placeholder : "Enter the phone number of the trustee"
          },
          {
            name: "position",
            label: "Position",
            required: true,
            placeholder : "Enter the position of the trustee"
          },

          {
            name: "display_order",
            label: "Display Order",
            type: "number",
            placeholder: "Enter the display order (numeric value)",
          },
         
          
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
             
            ]
          },
        
         
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
                  navigate("/organizations/trustees")
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
