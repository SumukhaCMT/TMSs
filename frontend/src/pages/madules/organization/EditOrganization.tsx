

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"

interface OrganizationForm {

  name: string
  legal_name?: string
  registration_number?: string
  email?: string
  phone: number
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  country?: string
  pincode: number
  status?: string
  timezone?: string
  img_name?: File | null

}

export default function EditOrganization() {

  const { id } = useParams()

  const navigate = useNavigate()

  const token = localStorage.getItem("token")

  const [formData, setFormData] =
    useState<OrganizationForm | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")



  // =========================
  // Fetch Organization
  // =========================

  useEffect(() => {

    const fetchOrganization = async () => {

      try {

        const res = await fetch(

          `https://tmscmt.netlify.appapi/v1/organizations/register/${id}`,

          {

            headers: {

              Authorization: `Bearer ${token}`,

            },

          }

        )

        const data = await res.json()

        if (!res.ok)
          throw new Error(data.message)

        setFormData(data.data)

      }

      catch (err: any) {

        setError(err.message)

      }

      finally {

        setLoading(false)

      }

    }

    if (id) fetchOrganization()

  }, [id])



  if (loading) return <p>Loading...</p>

  if (error) return <p>{error}</p>

  if (!formData) return null



  // =========================
  // Submit
  // =========================

  const handleSubmit = async (data: any) => {

    try {

      const formDataObj = new FormData()



      formDataObj.append("name", data.name || "")

      formDataObj.append("legal_name", data.legal_name || "")

      formDataObj.append(
        "registration_number",
        data.registration_number || ""
      )

      formDataObj.append("email", data.email || "")

      formDataObj.append("phone", data.phone || "")

      formDataObj.append(
        "address_line1",
        data.address_line1 || ""
      )

      formDataObj.append(
        "address_line2",
        data.address_line2 || ""
      )

      formDataObj.append("city", data.city || "")

      formDataObj.append("state", data.state || "")

      formDataObj.append("country", data.country || "")

      formDataObj.append("pincode", data.pincode || "")

      formDataObj.append("status", data.status || "")

      formDataObj.append("timezone", data.timezone || "")



      // Image file
      if (data.img_name instanceof File) {

        formDataObj.append("image", data.img_name)

      }



      const res = await fetch(

        `https://tmscmt.netlify.appapi/v1/organizations/register/${id}`,

        {

          method: "PUT",

          headers: {

            Authorization: `Bearer ${token}`,

          },

          body: formDataObj,

        }

      )



      const result = await res.json()



      if (!res.ok)
        throw new Error(result.message)



      alert("Updated successfully")

      navigate("/organizations")



    }

    catch (err: any) {

      alert(err.message)

    }

  }



  return (

    <div>

      <AppBreadcrumb

        items={[

          { label: "Dashboard", to: "/dashboard" },

          { label: "Organizations", to: "/organizations" },

          { label: "Edit Organization" },

        ]}

      />



      <FormBuilder

        title="Edit Organization"

        submitLabel="Update"

        defaultValues={formData}



        fields={[

          {

            name: "name",

            label: "Organization Name",

            required: true,

          },



          {

            name: "legal_name",

            label: "Legal Name",

          },



          {

            name: "img_name",

            label: "Organization Image",

            type: "image",

          },



          {

            name: "registration_number",

            label: "Registration Number",

          },



          {

            name: "email",

            label: "Email",

            type: "email",

          },



          {

            name: "phone",

            label: "Phone",

          },



          {

            name: "address_line1",

            label: "Address Line 1",

          },



          {

            name: "address_line2",

            label: "Address Line 2",

          },



          {

            name: "city",

            label: "City",

          },



          {

            name: "state",

            label: "State",

          },



          {

            name: "country",

            label: "Country",

          },



          {

            name: "pincode",

            label: "Pincode",

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

            name: "timezone",

            label: "Timezone",

            type: "select",

            options: [

              {

                label: "Asia/Kolkata",

                value: "Asia/Kolkata",

              },

            ],

          },

        ]}



        onSubmit={handleSubmit}

      />



    </div>

  )

}
