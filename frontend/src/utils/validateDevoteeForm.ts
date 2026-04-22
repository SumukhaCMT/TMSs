













































import type { DevoteeErrors } from "@/types/DevoteeErrors"

export interface DevoteeErrors {
  name?: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  gotra?: string
  rashi?: string
  nakshatra?: string
  address_line1?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  status?: string
  form?: string
}

export const validateDevoteeForm = (data: any): DevoteeErrors => {
  const errors: DevoteeErrors = {}

  // NAME
  if (!data.name?.trim()) {
    errors.name = "Name is required"
  } else if (data.name.length < 3) {
    errors.name = "Minimum 3 characters required"
  } else if (/\d/.test(data.name)) {
    errors.name = "Numbers not allowed"
  }

  // EMAIL
  if (!data.email?.trim()) {
    errors.email = "Email is required"
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.email = "Invalid email"
  }

  // PHONE
  if (!data.phone) {
    errors.phone = "Phone required"
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = "Enter valid 10 digit phone"
  }

  // GENDER
  if (!data.gender) {
    errors.gender = "Select gender"
  }

  // DOB
  if (data.dob) {
    const selectedDate = new Date(data.dob)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      errors.dob = "Future date of birth not allowed"
    }
  }

  if (!data.gotra?.trim()) errors.gotra = "Gotra required"
  if (!data.rashi?.trim()) errors.rashi = "Rashi required"
  if (!data.nakshatra?.trim()) errors.nakshatra = "Nakshatra required"
  if (!data.address_line1?.trim()) errors.address_line1 = "Address required"
  if (!data.city?.trim()) errors.city = "City required"
  if (!data.state?.trim()) errors.state = "State required"
  if (!data.country?.trim()) errors.country = "Country required"

  if (!data.pincode) {
    errors.pincode = "Pincode required"
  } else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Enter valid 6 digit pincode"
  }

  return errors
}