import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
// import axios from "axios"
import api from "@/axios/axios"
import FormBuilder from "@/components/common/FormBuilder"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { validateTokensForm } from "@/utils/validateTokensForm"
import { secureStorage } from "@/utils/secureStorage"
import { useAppDispatch } from "@/app/hooks"
import { addToken } from "@/features/tokens/tokensThunks"
import { toast } from "sonner"

type TokensErrors = {
  token_name?: string
  display_order?: string
  seva_search?: string
  deity_id?: string
}

export default function AddTokens() {
  const navigate = useNavigate()
  const token = secureStorage.getItem("token")
  const dispatch = useAppDispatch()

  const [errors, setErrors] = useState<TokensErrors>({})
  const [deities, setDeities] = useState<any[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }

        const [sevaRes, deityRes] = await Promise.all([
          api.get("/v1/temple/sevas", { headers }),
          api.get("/v1/temple/deities", { headers }),
        ])

        // If you need sevas later, keep it. Otherwise remove.
        // setSevas(sevaRes.data.data)

        setDeities(deityRes.data.data)
      } catch (err: any) {
        toast.error("Failed to fetch dropdown data")
      }
    }

    if (token) fetchAll()
  }, [token])

  const handleSubmit = async (data: any) => {
    const validationErrors = validateTokensForm(data)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await dispatch(addToken(data)).unwrap()
      toast.success("Tokens Added Successfully")
      navigate("/tokens")
    } catch (err: any) {
      let message = "Failed to create tokens"

      if (err?.response?.data?.message) {
        message = err.response.data.message
      } else if (err?.message) {
        message = err.message
      }

      toast.error(message)
    }
  }

  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Tokens", to: "/tokens" },
          { label: "Add Tokens" }
        ]}
      />

      <FormBuilder
        title="Add Tokens"
        submitLabel="Tokens"
        errors={errors}
        onSubmit={handleSubmit}
        defaultValues={{
          display_order: 1
        }}
        fields={[
          {
            name: "token_name",
            label: "Token Name",
            placeholder: "Enter Tokens Name",
            required: true
          },
          {
            name: "display_order",
            label: "Display Order",
            type: "number",
            required: true,
            placeholder: "Enter the display order (numeric value)"
          },
          {
            name: "seva_search",
            label: "Search Seva",
            type: "search",
            placeholder: "Search Seva",
            required: true,

            onSearch: async (value: string) => {
              const res = await api.get(
                `/v1/temple/sevas/search?q=${value}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )

              return res.data.data.map((item: any) => ({
                ...item,
                name: `${item.seva_name} - ₹${item.amount}`,
              }))
            },

            onSelect: (item: any, formState: any, setFormState: any) => {
              setFormState({
                ...formState,
                seva_id: item.id,
                seva_name: item.seva_name,
              })
            },
          },
          {
            name: "seva_name",
            label: "Seva Name",
            type: "text"
          },
          {
            name: "deity_id",
            label: "Deity",
            placeholder: "Select the deity",
            type: "search-select",
            required: true,
            options: deities.map((d) => ({
              label: d.name,
              value: d.id
            }))
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            colSpan: 4,
            placeholder: "Additional details about the tokens"
          }
        ]}
      />
    </>
  )
}