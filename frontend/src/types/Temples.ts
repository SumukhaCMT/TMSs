export interface Temples {
  id: number
  organization_id: number

  name: string
  img_name?: string | null
  legal_name?: string | null
  registration_number?: string | null

  email?: string | null
  phone?: string | null

  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null

  slug?: string | null
  is_primary?: number
  status?: string

  timezone?: string

  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}