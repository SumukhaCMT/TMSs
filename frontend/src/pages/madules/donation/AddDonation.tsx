
import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
// import { useParams } from "react-router-dom"

export default function AddDonation() {
  // const { id } = useParams() // donation id from route

  return (
    <div className="space-y-6">
      {/* 🔗 Breadcrumb */}
     <AppBreadcrumb
             items={[
               { label: "Dashboard", to: "/dashboard" },
               { label: "Donations List", to: "/donations" },
               { label: "Add Donations" },
             ]}
           />

      {/* 🧾 Form Card */}
    
        <FormBuilder
                title="Add Donation"
                submitLabel="Save Donation"
                 
                fields={[
                  { name: "donor Name", label: "Donor Name", placeholder: "Enter donor name" },
                  { name: "email", label: "Email",placeholder:"Enter email", type: "email" },
                  { name: "amount", label: "Amount",placeholder:"Enter amount" , type: "number" },
                  { name: "donationType", label: "Donation Type",placeholder:"Cash /Online"  },
                   {
                    name: "purpose",
                    label: "Purpose",
                    placeholder: "Donation purpose",
                    colSpan: 2,
                  },
                  {
                    name: "role",
                    label: "Role",
                    type: "select",
                    placeholder: "Select role",
                      
                    options: [
                      { label: "User", value: "user" },
                      { label: "Admin", value: "admin" },
                      { label: "Manager", value: "manager" },
                     
                    ],
                  },
                            {
                    name: "deitiesType",
                    label: "Deities  Type",
                    type: "radio",
                  
                    options: [
                      { label: "Cash", value: "cash" },
                      { label: "Online", value: "online" },
                    ],
                  },
                  {
                    name: "isActive",
                    label: "Status",
                    type: "checkbox",
                    placeholder: "Active",
                  },
        {
                    name: "Texarea",
                    label: "Textarea",
                    type: "textarea",
                   
                     colSpan: 2,
                  },
                 
                ]}
                onSubmit={(data) => {
                  console.log("Donation Data:", data)
                }}
              />
     
    </div>
  )
}

