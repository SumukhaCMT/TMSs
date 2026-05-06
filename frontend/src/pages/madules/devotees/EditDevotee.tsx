
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validateDevoteeForm } from "@/utils/validateDevoteeForm"
import api from "@/axios/axios"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export default function EditDevotee() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<any>()
  const [errors, setErrors] = useState<any>({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (id) fetchDevotee()
  }, [id])

  // ================= FETCH =================
  const fetchDevotee = async () => {
    try {
      const res = await api.get("/v1/temple/devotees")

      const devotee = res.data.data.find(
        (d: any) => d.id == id
      )

      if (!devotee) throw new Error("Devotee not found")

      if (devotee.dob) {
        devotee.dob = devotee.dob.split("T")[0]
      }

      setData(devotee)

    } catch (err: any) {
      console.error(err)
    }
  }

  // ================= SUBMIT =================
  const handleSubmit = async (formData: any) => {

    const validationErrors = validateDevoteeForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      // get all devotees
      const res = await api.get("/v1/temple/devotees")
      const devotees = res.data.data

      // email check
      const emailExists = devotees.find(
        (d: any) =>
          d.email === formData.email &&
          d.id != id
      )

      if (emailExists) {
        setErrors({ email: "Email already exists" })
        return
      }

      // phone check
      const phoneExists = devotees.find(
        (d: any) =>
          d.phone === formData.phone &&
          d.id != id
      )

      if (phoneExists) {
        setErrors({ phone: "Phone number already exists" })
        return
      }

      // update
      await api.put(
        `/v1/temple/devotees/${id}`,
        formData
      )

      setErrors({})
      setOpen(true)

    } catch (err: any) {
      console.error(err)
    }
  }

  if (!data) return <>Loading...</>

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Devotees", to: "/devotees" },
          { label: "Edit Devotee" },
        ]}
      />

      <FormBuilder
        title="Edit Devotee"
        submitLabel="Update"
        defaultValues={data}
        errors={errors}
        onSubmit={handleSubmit}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "email", label: "Email", required: true },
          { name: "phone", label: "Phone", required: true },

          {
            name: "gender",
            label: "Gender",
            type: "search-select",
            placeholder: "Select the gender",
            options: [
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ],
          },

          {
            name: "dob",
            label: "DOB",
            type: "date",
            max: new Date().toISOString().split("T")[0],
          },

          { name: "gotra", label: "Gotra", placeholder: "Select the gotra" },
          { name: "rashi", label: "Rashi", placeholder: "Select the rashi" },
          { name: "nakshatra", label: "Nakshatra", placeholder: "Select the nakshatra" },

          { name: "address_line1", label: "Address Line 1", required: true },
          { name: "address_line2", label: "Address Line 2", placeholder: "Enter the second line of the address (optional)" },
          { name: "city", label: "City", required: true, placeholder: "Enter the city (optional)" },
          { name: "state", label: "State", required: true, placeholder: "Enter the state (optional)" },
          { name: "country", label: "Country", required: true, placeholder: "Enter the country (optional)" },
          { name: "pincode", label: "Pincode", required: true, placeholder: "Enter the pincode (optional)" },

          {
            name: "status",
            label: "Status",
            type: "search-select",
            placeholder: "Select the status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },

          {
            name: "remark",
            label: "Remark",
            type: "textarea",
            colSpan: 4,
            placeholder: "Enter any additional remarks about the devotee (optional)",
          },
        ]}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Devotee Updated Successfully
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => navigate("/devotees")}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}