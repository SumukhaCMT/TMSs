

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { secureStorage } from "@/utils/secureStorage"
import { validateDevoteeForm } from "@/utils/validateDevoteeForm"

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
    fetchDevotee()
  }, [])

  const fetchDevotee = async () => {
    try {
      const token = secureStorage.getItem("token")

      const res = await axios.get(
        "http://localhost:5000/api/v1/temple/devotees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const devotee = res.data.data.find(
        (d: any) => d.id == id
      )

      if (devotee?.dob) {
        devotee.dob = devotee.dob.split("T")[0]
      }

      setData(devotee)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (formData: any) => {
    const token = secureStorage.getItem("token")

    //  First: Normal validation
    const validationErrors = validateDevoteeForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      //  Fetch all devotees to check duplicate
      const res = await axios.get(
        "http://localhost:5000/api/v1/temple/devotees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const devotees = res.data.data

      //  Email duplicate check (exclude current id)
      const emailExists = devotees.find(
        (d: any) =>
          d.email === formData.email &&
          d.id != id
      )

      if (emailExists) {
        setErrors({ email: "Email already exists" })
        return
      }

      //  Phone duplicate check (exclude current id)
      const phoneExists = devotees.find(
        (d: any) =>
          d.phone === formData.phone &&
          d.id != id
      )

      if (phoneExists) {
        setErrors({ phone: "Phone number already exists" })
        return
      }

      //  Update
      await axios.put(
        `http://localhost:5000/api/v1/temple/devotees/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setErrors({})
      setOpen(true)
    } catch (error) {
      console.error(error)
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
          { name: "name", label: "Name",
            required: true,
            placeholder: "Enter the devotee's full name"
           },
          { name: "email", label: "Email",
            required: true,
            placeholder: "Enter the devotee's email address"
           },
          { name: "phone", label: "Phone" ,
            required: true,
            placeholder: "Enter the devotee's phone number"
          },

          {
            name: "gender",
            label: "Gender",
            type: "select",
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

          { name: "gotra", label: "Gotra", placeholder: "Enter the devotee's gotra" },
          { name: "rashi", label: "Rashi", placeholder: "Enter the devotee's rashi" },
          { name: "nakshatra", label: "Nakshatra", placeholder: "Enter the devotee's nakshatra" },

         

          { name: "address_line1", label: "Address Line 1",         required: true, placeholder: "Enter the first line of the devotee's address" },
          { name: "address_line2", label: "Address Line 2", placeholder: "Enter the second line of the devotee's address (optional)" },
          { name: "city", label: "City" ,
                     required: true,
                     placeholder: "Enter the city of residence"
          },
          { name: "state", label: "State",
                     required: true,
                      placeholder: "Enter the state of residence"
           },
          { name: "country", label: "Country",
                     required: true,
                      placeholder: "Enter the country of residence"
           },
          { name: "pincode", label: "Pincode",
              required: true,
              placeholder: "Enter the postal code"
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
            name: "remark",
            label: "Remark",
            type: "textarea",
            colSpan: 4,
            placeholder: "Additional notes about the devotee",
          },
        ]}
      />

      {/* SUCCESS DIALOG */}
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