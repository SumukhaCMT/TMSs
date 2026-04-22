
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { secureStorage } from "@/utils/secureStorage"
import imageCompression from "browser-image-compression"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import api, { IMAGE_URLS } from "@/axios/axios";
export default function EditDeity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = secureStorage.getItem("token")

  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dialogMessage, setDialogMessage] = useState("")

  // const IMAGE_URL = "https://tmscmt.netlify.apppublic/deities/"; 
  // ================= FETCH =================
  useEffect(() => {
    const fetchDeity = async () => {
      try {
        const res = await fetch(
          "https://tmscmt.netlify.appapi/v1/temple/deities",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const result = await res.json()
        const deity = result.data.find((d: any) => d.id == id)

        setFormData(deity)
      } catch (error) {
        setDialogMessage("Failed to fetch deity")
        setOpenDialog(true)
      } finally {
        setLoading(false)
      }
    }

    if (token && id) {
      fetchDeity()
    }
  }, [id, token])

  if (loading) return <>Loading...</>
  if (!formData) return null

  // ================= VALIDATION =================
  const validateForm = (data: any) => {
    const newErrors: Record<string, string> = {}
    const deitiesName = data.name?.trim() || ""

    if (!deitiesName) {
      newErrors.name = "Name is required"
    }
    else if (deitiesName.length < 3) {
      newErrors.name = "Minimum 3 characters required"
    }
    else if (deitiesName.length > 50) {
      newErrors.name = "Maximum 50 characters allowed"
    }
    else if (/\d/.test(deitiesName)) {
      newErrors.name = "Numbers are not allowed"
    }

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
      const formDataObj = new FormData()

      formDataObj.append("name", data.name.trim())
      formDataObj.append("code", data.code.trim())
      formDataObj.append("description", data.description || "")
      formDataObj.append("status", data.status || "active")

      //  Convert to WebP before sending
      if (data.img_name instanceof File) {

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp",
        }

        const compressedFile = await imageCompression(data.img_name, options)

        const webpFile = new File(
          [compressedFile],
          data.img_name.name.replace(/\.[^/.]+$/, ".webp"),
          { type: "image/webp" }
        )

        formDataObj.append("img_name", webpFile)
      }

      const res = await fetch(
        `https://tmscmt.netlify.appapi/v1/temple/deities/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataObj,
        }
      )

      const result = await res.json()

      if (!res.ok) {
        if (result.message?.toLowerCase().includes("duplicate")) {
          setErrors({ code: "Code already exists" })
          return
        }

        setDialogMessage(result.message || "Update failed")
        setOpenDialog(true)
        return
      }

      //  Success
      setDialogMessage("Deity Updated Successfully")
      setOpenDialog(true)

    } catch (err: any) {
      setDialogMessage("Something went wrong")
      setOpenDialog(true)
    }
  }
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
            name: "name", label: "Name",
            required: true,
            placeholder: "Enter the name of the deity"

          },

          {
            name: "code", label: "Code",
            required: true,
            placeholder: "Enter a unique code for the deity"
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
          {
            name: "img_name",
            label: "Image",
            type: "image",
            url: formData.img_name ? IMAGE_URLS.deities + formData.img_name : null, alt: formData.name || "Deity Image"

          },

          {
            name: "description",
            label: "Description",
            type: "textarea",
            colSpan: 4,
            placeholder: "Provide a detailed description of the deity, including history, significance, and any special attributes or stories associated with them."
          },

        ]}
      />

      {/*  SUCCESS / ERROR DIALOG */}
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