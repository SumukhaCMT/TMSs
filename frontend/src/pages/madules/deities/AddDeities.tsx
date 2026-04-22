import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"

import { validateDeityForm } from "@/utils/validateDeityForm"
import { useState } from "react"
import { secureStorage } from "@/utils/secureStorage"
import { toast } from "sonner"

import imageCompression from "browser-image-compression"

export default function AddDeity() {

  const [errors, setErrors] = useState<any>({})
  const [resetKey, setResetKey] = useState(0) //  used to reset form

  const handleSubmit = async (data: any) => {

    // 🔹 Validate form
    const validationErrors = validateDeityForm(data)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const token = secureStorage.getItem("token")

      const formData = new FormData()
      formData.append("name", data.deitiesName)
      formData.append("code", data.code)
      formData.append("description", data.Texarea || "")
      formData.append("status", "active")

      //  Image compression
      if (data.img_name instanceof File) {

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp"
        }

        const compressedFile = await imageCompression(data.img_name, options)

        const webpFile = new File(
          [compressedFile],
          data.img_name.name.replace(/\.[^/.]+$/, ".webp"),
          { type: "image/webp" }
        )

        formData.append("img_name", webpFile)
      }

      await axios.post(
        "https://tmscmt.netlify.app/api/v1/temple/deities",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`

          }
        }
      )

      toast.success("Seva Added Successfully ")

      //  RESET FORM
      setResetKey(prev => prev + 1)
      setErrors({})

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create deity "
      )
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Deities", to: "/deities" },
          { label: "Add Deities" }
        ]}
      />

      <FormBuilder
        key={resetKey}
        title="Add Deities"
        submitLabel="Save"
        onSubmit={handleSubmit}
        errors={errors}
        fields={[
          {
            name: "deitiesName",
            label: "Deities Name",
            required: true,
            placeholder: "Enter the name of the deity"
          },
          {
            name: "img_name",
            label: "Image",
            type: "image"
          },
          {
            name: "code",
            label: "Code",
            required: true,
            placeholder: "Enter a unique code for the deity"
          },
          {
            name: "Texarea",
            label: "Description",
            type: "textarea",
            colSpan: 4,
            placeholder:
              "Provide a detailed description of the deity, including history and significance."
          }
        ]}
      />
    </>
  )
}