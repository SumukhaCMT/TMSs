
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import imageCompression from "browser-image-compression"
import api, { IMAGE_URLS } from "@/axios/axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

export default function EditDeity() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dialogMessage, setDialogMessage] = useState("")

  // ================= FETCH =================
  useEffect(() => {
    if (id) fetchDeity()
  }, [id])

  const fetchDeity = async () => {
    try {
      const res = await api.get("/v1/temple/deities")

      const deity = res.data.data.find((d: any) => d.id == id)

      if (!deity) throw new Error("Deity not found")

      setFormData(deity)

    } catch (err: any) {
      setDialogMessage(err.message || "Failed to fetch deity")
      setOpenDialog(true)
    } finally {
      setLoading(false)
    }
  }

  // ================= VALIDATION =================
  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {}
    const name = data.name?.trim() || ""

    if (!name) newErrors.name = "Name is required"
    else if (name.length < 3) newErrors.name = "Minimum 3 characters required"
    else if (name.length > 50) newErrors.name = "Maximum 50 characters allowed"
    else if (/\d/.test(name)) newErrors.name = "Numbers are not allowed"

    if (!data.code?.trim()) {
      newErrors.code = "Code is required"
    }

    return newErrors
  }

  // ================= UPDATE =================
  const handleSubmit = async (data: any) => {
    const validationErrors = validateForm(data)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    try {
      const payload = new FormData()

      payload.append("name", data.name.trim())
      payload.append("code", data.code.trim())
      payload.append("description", data.description || "")
      payload.append("status", data.status || "active")

      if (data.img_name instanceof File) {
        const compressedFile = await imageCompression(data.img_name, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        })

        const webpFile = new File(
          [compressedFile],
          data.img_name.name.replace(/\.[^/.]+$/, ".webp"),
          { type: "image/webp" }
        )

        payload.append("img_name", webpFile)
      }

      // await api.put(`/v1/temple/deities/${id}`, payload)
              await api.put(`/v1/temple/deities/${id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

      setDialogMessage("Deity Updated Successfully")
      setOpenDialog(true)

    } catch (err: any) {
      let message =
        err.response?.data?.message || "Update failed"

      if (message.toLowerCase().includes("duplicate")) {
        setErrors({ code: "Code already exists" })
        return
      }

      setDialogMessage(message)
      setOpenDialog(true)
    }
  }

  if (loading) return <>Loading...</>
  if (!formData) return null

  return (
    <div>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Deities", to: "/deities" },
          { label: "Edit" },
        ]}
      />

      <FormBuilder
        title="Edit Deity"
        submitLabel="Update"
        defaultValues={formData}
        onSubmit={handleSubmit}
        errors={errors}
        fields={[
          {
            name: "name",
            label: "Name",
            required: true,
            placeholder: "Enter the name",
          },
          {
            name: "code",
            label: "Code",
            required: true,
            placeholder: "Enter the code",
          },
          {
            name: "status",
            label: "Status",
            type: "search-select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            name: "img_name",
            label: "Image",
            type: "image",
            url: formData?.img_name
              ? IMAGE_URLS.deities + formData.img_name
              : null,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            colSpan: 4,
            placeholder: "Enter the description",
          },
        ]}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpenDialog(false)
                if (dialogMessage === "Deity Updated Successfully") {
                  navigate("/deities")
                }
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}