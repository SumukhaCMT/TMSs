import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "@/app/hooks"
import { addTrustee } from "@/features/trustees/trusteesThunks"
import { toast } from "sonner"
import { useState } from "react"
import { validateTrustees } from "@/utils/validateTrustees"
export default function AddTrustee() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (data: any) => {
    const payload = {
    
      ...data
    }
  const validationErrors = validateTrustees(data)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }
    try {
      await dispatch(addTrustee(payload)).unwrap()

      toast.success("Trustee Added Successfully")
      navigate("/trustees")

    } catch (err: any) {
      if (err?.errors) {
        setErrors(err.errors)
      } else {
        toast.error(err?.message || "Something went wrong")
      }
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Trustees", to: "/organizations/trustees" },
          { label: "Add Trustee", },
        ]}
      />

      <FormBuilder
        title="Add Trustee"
        submitLabel="Save"
        onSubmit={handleSubmit}
        defaultValues={{
         
          display_order: 1
        }}
        errors={errors}
        fields={[
          { name: "name", label: "Name", required: true ,placeholder:"Enter Trustee Name"},
          { name: "email", label: "Email", required: true ,placeholder:"Enter Email"},
          { name: "phone", label: "Phone", required: true ,placeholder:"Enter Phone"},
          { name: "position", label: "Position", placeholder:"Enter Position",required: true },
          { name: "display_order", label: "Display Order" },
          { name: "address_line1", label: "Address Line 1" ,placeholder:"Enter Address Line 1",required: true},
          { name: "address_line2", label: "Address Line 2" ,placeholder:"Enter Address Line 2",required: true},
          { name: "city", label: "City" ,placeholder:"Enter City",required: true},
          { name: "state", label: "State" ,placeholder:"Enter State",required: true},
          { name: "country", label: "Country" ,placeholder:"Enter Country",required: true},
          { name: "pincode", label: "Pincode" ,placeholder:"Enter Pincode",required: true},
         
        ]}
      />
    </>
  )
}
