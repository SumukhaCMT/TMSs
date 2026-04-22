import api from "@/axios/axios"
import type { Temples } from "@/types/Temples"

export const templeService = {


  getTemples: async () => {
    const res = await api.get("/v1/temple/temples")
    return res.data.data   // ✅ must return array
  },


  getTemple: async (id: string) => {
    const res = await api.get(`/v1/temple/temples/${id}`)
    return res.data.data
  },

  createTemple: async (data: Partial<Temples>) => {
    const res = await api.post("/v1/temple/temples", data)
    return res.data
  },

  updateTemple: async (id: string, data: Partial<Temples>) => {
    const res = await api.put(`/v1/temple/temples/${id}`, data)
    return res.data
  },

  deleteTemple: async (id: string) => {
    const res = await api.delete(`/v1/temple/temples/${id}`)
    return res.data
  },
}