import { useEffect, useState } from "react"
import { getOrganizations } from "@/services/organization.service"

export interface Organization {
  id: number
  name: string
  email: string
  phone: string
  country: string
  slug: string
  legal_name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
   created_at: string // ✅ ADD THIS
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getOrganizations()
      .then((data) => {
        setOrganizations(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { organizations, loading, error }
}
