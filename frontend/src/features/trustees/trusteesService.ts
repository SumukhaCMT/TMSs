import api from "@/axios/axios"
import type { Trustees } from "@/types/trustees"

export const trusteesService = {

  getTrustees: async () => {
    const res = await api.get("/v1/temple/trustees")
    return res.data.data
  },

  getTrustee: async (id: string) => {
    const res = await api.get(`/v1/temple/trustees/${id}`)
    return res.data.data
  },

  createTrustee: async (data: Partial<Trustees>) => {
    const res = await api.post("/v1/temple/trustees", data)
    return res.data
  },

  updateTrustee: async (id: string, data: Partial<Trustees>) => {
    const res = await api.put(`/v1/temple/trustees/${id}`, data)
    return res.data
  },

  deleteTrustee: async (id: string) => {
    await api.delete(`/v1/temple/trustees/${id}`)
    return id
  }
}