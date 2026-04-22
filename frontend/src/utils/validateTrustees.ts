import type { Trustees } from "@/types/trustees"


export interface TrusteesErrors {

  name?: string

  email?: string

  phone?: string

  display_order?: string

position?: string

address_line1?: string
address_line2?: string
city?: string
state?: string
country?: string
pincode?: string

  form?: string

}


export const validateTrustees = (data: Partial<Trustees>): TrusteesErrors => {

  const errors: TrusteesErrors = {}

  const name = data.name || ""

  if (!name.trim()) {

    errors.name = "Name is required"

  }

  else if (name.trim().length < 3) {

    errors.name = "Minimum 3 characters required"

  }

  else if (name.length > 50) {

    errors.name = "Maximum 50 characters allowed"

  }

  else if (/\d/.test(name)) {

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

  // POSITION
  if (!data.position?.trim()) {
    errors.position = "Position is required"
  }
  else if (data.position.trim().length < 2) {
    errors.position = "Minimum 2 characters required"
  }
  else if (data.position.length > 50) {
    errors.position = "Maximum 50 characters allowed"
  }
  // ADDRESS LINE 1
  if (!data.address_line1?.trim()) {
    errors.address_line1 = "Address Line 1 is required"
  }
  else if (data.address_line1.trim().length < 5) {
    errors.address_line1 = "Minimum 5 characters required"
  }
  else if (data.address_line1.length > 100) {
    errors.address_line1 = "Maximum 100 characters allowed"
  }

  // ADDRESS LINE 2
  if (data.address_line2 && data.address_line2.trim().length < 5) {
    errors.address_line2 = "Minimum 5 characters required"
  }
  else if (data.address_line2 && data.address_line2.length > 100) {
    errors.address_line2 = "Maximum 100 characters allowed"
  }

  // CITY
  if (!data.city?.trim()) {
    errors.city = "City is required"
  }
  else if (data.city.trim().length < 2) {
    errors.city = "Minimum 2 characters required"
  }
  else if (data.city.length > 50) {
    errors.city = "Maximum 50 characters allowed"
  }

  // STATE
  if (!data.state?.trim()) {
    errors.state = "State is required"
  }
  else if (data.state.trim().length < 2) {
    errors.state = "Minimum 2 characters required"
  }
  else if (data.state.length > 50) {
    errors.state = "Maximum 50 characters allowed"
  }

  // COUNTRY
  if (!data.country?.trim()) {
    errors.country = "Country is required"
  }
  else if (data.country.trim().length < 2) {
    errors.country = "Minimum 2 characters required"
  }
  else if (data.country.length > 50) {
    errors.country = "Maximum 50 characters allowed"
  }
  // PINCODE
  if (!data.pincode?.trim()) {
    errors.pincode = "Pincode is required"
  }
  else if (!/^\d{6}$/.test(data.pincode)) {
    errors.pincode = "Enter valid 6 digit pincode"
  }

  return errors

}