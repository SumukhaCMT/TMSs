

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
// import axios from "axios"
import api from "@/axios/axios"

import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { validateSevaBookingForm } from "@/utils/validateSevaBooking";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { secureStorage } from "@/utils/secureStorage"

export default function EditSevaBooking() {
 const today = new Date().toISOString().split("T")[0]; //  FIXED
const now = new Date();
  const { id } = useParams()

  const navigate = useNavigate()

  const [data, setData] = useState<any>(null)

  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)

  const [error, setError] = useState("")

  const [errors, setErrors] = useState<any>({});
  useEffect(() => {

    if (id) {

      fetchSeva()

    }

  }, [id])



  //  FETCH SINGLE SEVA

  const fetchSeva = async () => {

    try {

      const token = secureStorage.getItem("token")

      const res = await api.get(

        `/v1/temple/seva-bookings/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )

      setData(res.data.data)

    }

    catch (err: any) {

      setError(

        err.response?.data?.message ||

        "Failed to load seva"

      )

    }

    finally {

      setLoading(false)

    }

  }



  //  UPDATE SEVA

  const handleSubmit = async (formData: any) => {
  const validationErrors = validateSevaBookingForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // <-- show inline errors
      return;
    }
    try {

      const token = secureStorage.getItem("token")

      await api.put(

        `/v1/temple/seva-bookings/${id}`,

        formData,

        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

      )

      setOpen(true)

    }

    catch (err: any) {

      setError(

        err.response?.data?.message ||

        "Update failed"

      )

    }

  }



  if (loading)

    return <>Loading...</>



  if (error)

    return <p className="text-red-500">{error}</p>



  return (

    <>

      <AppBreadcrumb

        items={[

          { label: "Dashboard", to: "/dashboard" },

          { label: "Seva Bookings", to: "/seva-booking" },

          { label: "Edit Seva Booking" }

        ]}

      />


      <FormBuilder

        title="Edit Seva Booking"

        submitLabel="Update"

        defaultValues={data}
  errors={errors} 
        onSubmit={handleSubmit}

       
fields={[

  // BASIC
  
  {
    name: "seva_id",
    label: "Seva ID",
    type: "number",
    disabled: true
  },
  {
    name: "deity_id",
    label: "Deity ID",
    type: "number",
    disabled: true
  },

  // DEVOTEE DETAILS
  {
    name: "devotee_name",
    label: "Devotee Name",
    placeholder: "Enter the full name of the devotee"
  },
  {
    name: "devotee_phone",
    label: "Phone",
    placeholder: "Enter the devotee's phone number"
  },
  {
    name: "devotee_email",
    label: "Email",
    type: "email",
    placeholder: "Enter the devotee's email address"
  },
  {
    name: "devotee_gotra",
    label: "Gotra",
    placeholder: "Enter the gotra for the devotee"
  },
  {
    name: "devotee_rashi",
    label: "Rashi",
    placeholder: "Enter the rashi for the devotee"
  },
  {
    name: "devotee_nakshatra",
    label: "Nakshatra",
    placeholder: "Enter the nakshatra for the devotee"
  },
  {
    name: "devotee_dob",
    label: "DOB",
    type: "date",
       max: new Date().toISOString().split("T")[0]  
  },
  {
    name: "devotee_gender",
    label: "Gender",
    type: "search-select",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" }
    ]
  },

  // SEVA
  {
    name: "seva_name",
    label: "Seva Name",
    required: true,
    placeholder: "Enter the name of the seva"
  },
  {
    name: "seva_amount",
    label: "Amount",
    type: "number",
    required: true,
    placeholder: "Enter the amount for the seva booking"
  },
  {
    name: "quantity",
    label: "Quantity",
    type: "number",
    placeholder: "Enter the quantity for the seva booking"
  },

  // DATE
  {
    name: "calendar_type",
    label: "Calendar",
    type: "search-select",
    options: [
      { label: "Gregorian", value: "gregorian" },
      { label: "Hindu", value: "hindu" }
    ]
  },

  {
    name: "scheduled_date",
    label: "Scheduled Date",
    type: "date",
  
  },
  {
    name: "scheduled_time",
    label: "Scheduled Time",
    type: "time"
  },

  // RECURRING
  {
    name: "is_recurring",
    label: "Recurring",
    type: "search-select",
    options: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" }
    ]
  },

  {
    name: "recurring_interval",
    label: "Interval",
    type: "search-select",
    options: [
      { label: "Daily", value: "daily" },
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Yearly", value: "yearly" }
    ]
  },

  {
    name: "recurring_count",
    label: "Recurring Count",
    type: "number"
  },

  // PAYMENT
  {
    name: "payment_status",
    label: "Payment Status",
    type: "search-select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Paid", value: "paid" },
      { label: "Partial", value: "partial" },
      { label: "Failed", value: "failed" }
    ]
  },

  {
    name: "payment_method_snapshot",
    label: "Payment Method",
    placeholder: "Enter the payment method used by the devotee"
  },

  {
    name: "total_amount",
    label: "Total Amount",
    type: "number",
    required: true,
    placeholder: "Enter the total amount for the seva booking"  
  },

  {
    name: "paid_amount",
    label: "Paid Amount",
    type: "number",
    placeholder: "Enter the amount paid by the devotee"
  },

  {
    name: "receipt_number",
    label: "Receipt Number",
    placeholder: "Enter the receipt number"
  },

  // STATUS
  {
    name: "status",
    label: "Status",
    type: "search-select",
    options: [
      { label: "Booked", value: "booked" },
      { label: "Confirmed", value: "confirmed" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" }
    ]
  },

  // NOTES
  {
    name: "remark",
    label: "Remark",
    type: "textarea",
    colSpan: 4,
      placeholder: "This remark will be visible to devotees"
  },
  {
    name: "internal_note",
    label: "Internal Note",
    type: "textarea",
    colSpan: 4,
      placeholder: "This note is for internal use and will not be visible to devotees"
    
  }

]}
      />



      {/* SUCCESS POPUP */}


      <Dialog open={open} onOpenChange={setOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>

               Seva Updated Successfully

            </DialogTitle>

          </DialogHeader>

          <DialogFooter>

            <Button

              onClick={() => {

                setOpen(false)

                navigate("/seva-booking")

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
