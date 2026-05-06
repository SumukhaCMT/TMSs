
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validateDevoteeForm } from "@/utils/validateDevoteeForm"

import { useAppDispatch } from "@/app/hooks"
import { addDevotee } from "@/features/devotees/devoteesThunks"

import { toast } from "sonner"

export default function AddDevotee() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const handleSubmit = async (data: any) => {
    //  Validate
    const validationErrors = validateDevoteeForm(data)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)

      //  Dispatch thunk
      await dispatch(addDevotee(data)).unwrap()

      //  Success
      toast.success("Devotee created successfully")
        //  RESET FORM
      setResetKey(prev => prev + 1)
      setErrors({})

    } catch (err: any) {
      console.log("ERROR:", err)

      //  IMPORTANT: err is already message (from rejectWithValue)
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Failed to create devotee"

      //  Handle duplicate cases nicely
      if (message.toLowerCase().includes("email")) {
        toast.error("Email already exists or phone number")
      
      } else {
        toast.error(message)
      }

    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Devotees", to: "/devotees" },
          { label: "Add Devotee" },
        ]}
      />

      <FormBuilder
       key={resetKey}  
        title="Add Devotee"
        submitLabel={loading ? "Saving..." : "Save"}
        errors={errors}
        onSubmit={handleSubmit}
        fields={[
          {
            name: "name",
            label: "Name",
            required: true,
            placeholder: "Enter the devotee's full name",
          },
          {
            name: "email",
            label: "Email",
            required: true,
            placeholder: "Enter the devotee's email address",
          },
          {
            name: "phone",
            label: "Phone",
            required: true,
            placeholder: "Enter the devotee's phone number",
          },
          {
            name: "gender",
            label: "Gender",
            type: "search-select",
            required: true,
            options: [
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ],
          },
          {
            name: "dob",
            label: "Date of Birth",
            type: "date",
            max: new Date().toISOString().split("T")[0],
          },

          {
            name: "gotra",
            label: "Gotra",
            type: "search-select",
            required: true,
            placeholder: "Select the gotra",
            options: [
                 { label: "Bharadwaj", value: "bharadwaj" },
                  { label: "Kashyapa", value: "kashyapa" },
                  { label: "Vasishta", value: "vasishta" },
                  { label: "Vishwamitra", value: "vishwamitra" },
                  { label: "Atri", value: "atri" },
                  { label: "Agastya", value: "agastya" },
                  { label: "Gautama", value: "gautama" },
                  { label: "Jamadagni", value: "jamadagni" },
                  { label: "Angirasa", value: "angirasa" },
                  { label: "Koundinya", value: "koundinya" },
                  { label: "Shandilya", value: "shandilya" },
                  { label: "Harita", value: "harita" },
                  { label: "Kaushika", value: "kaushika" },
                  { label: "Mudgala", value: "mudgala" },
                  { label: "Parashara", value: "parashara" },
            ],
          },

          {
            name: "rashi",
            label: "Rashi",
            type: "search-select",
            placeholder: "Select the rashi",
            required: true,
            options: [
                 { label: "Mesha (Aries)", value: "mesha" },
                  { label: "Vrishabha (Taurus)", value: "vrishabha" },
                  { label: "Mithuna (Gemini)", value: "mithuna" },
                  { label: "Karka (Cancer)", value: "karka" },
                  { label: "Simha (Leo)", value: "simha" },
                  { label: "Kanya (Virgo)", value: "kanya" },
                  { label: "Tula (Libra)", value: "tula" },
                  { label: "Vrischika (Scorpio)", value: "vrischika" },
                  { label: "Dhanu (Sagittarius)", value: "dhanu" },
                  { label: "Makara (Capricorn)", value: "makara" },
                  { label: "Kumbha (Aquarius)", value: "kumbha" },
                  { label: "Meena (Pisces)", value: "meena" },
            ],
          },

          {
            name: "nakshatra",
            label: "Nakshatra",
            type: "search-select",
            required: true,
            placeholder: "Select the nakshatra",
            options: [
                  { label: "Ashwini", value: "ashwini" },
    { label: "Bharani", value: "bharani" },
    { label: "Krittika", value: "krittika" },
    { label: "Rohini", value: "rohini" },
    { label: "Mrigashirsha", value: "mrigashirsha" },
    { label: "Ardra", value: "ardra" },
    { label: "Punarvasu", value: "punarvasu" },
    { label: "Pushya", value: "pushya" },
    { label: "Ashlesha", value: "ashlesha" },
    { label: "Magha", value: "magha" },
    { label: "Purva Phalguni", value: "purva_phalguni" },
    { label: "Uttara Phalguni", value: "uttara_phalguni" },
    { label: "Hasta", value: "hasta" },
    { label: "Chitra", value: "chitra" },
    { label: "Swati", value: "swati" },
    { label: "Vishakha", value: "vishakha" },
    { label: "Anuradha", value: "anuradha" },
    { label: "Jyeshtha", value: "jyeshtha" },
    { label: "Mula", value: "mula" },
    { label: "Purva Ashadha", value: "purva_ashadha" },
    { label: "Uttara Ashadha", value: "uttara_ashadha" },
    { label: "Shravana", value: "shravana" },
    { label: "Dhanishta", value: "dhanishta" },
    { label: "Shatabhisha", value: "shatabhisha" },
    { label: "Purva Bhadrapada", value: "purva_bhadrapada" },
    { label: "Uttara Bhadrapada", value: "uttara_bhadrapada" },
    { label: "Revati", value: "revati" },
            ],
          },

          {
            name: "address_line1",
            label: "Address Line 1",
            required: true,
            placeholder: "Enter the first line of the address",
          },
          {
            name: "address_line2",
            label: "Address Line 2",
            placeholder: "Enter the second line of the address (optional)",
          },
          {
            name: "city",
            label: "City",
            required: true,
            placeholder: "Enter the city",
          },
          {
            name: "state",
            label: "State",
            required: true,
            placeholder: "Enter the state",
          },
          {
            name: "country",
            label: "Country",
            required: true,
            placeholder: "Enter the country",
          },
          {
            name: "pincode",
            label: "Pincode",
            required: true,
            placeholder: "Enter the pincode",
          },
          {
            name: "remark",
            label: "Remark",
            type: "textarea",
            colSpan: 4,
            placeholder: "Enter any additional remarks about the devotee",
          },
        ]}
      />
    </>
  )
}