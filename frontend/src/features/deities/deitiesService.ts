import api from "@/axios/axios"

export const deitiesService = {
  getDeities: async () => {
    const res = await api.get("/v1/temple/deities")
    return res.data.data
  },

  deleteDeity: async (id: string) => {
    const res = await api.delete(`/v1/temple/deities/${id}`)
    return res.data
  },
   addDeities: async (formData: FormData) => {
    const res = await api.post("/v1/temple/deities", formData)
    return res.data.data
  },
}