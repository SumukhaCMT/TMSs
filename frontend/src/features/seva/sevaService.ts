import api from "@/axios/axios"
import type { Seva } from "@/types/Seva"

export const sevaService = {

  getSevas: async () => {
    const res = await api.get("/v1/temple/sevas")
    return res.data.data
  },

  getSeva: async (id: string) => {
    const res = await api.get(`/v1/temple/sevas/${id}`)
    return res.data.data
  },

  createSeva: async (data: Partial<Seva>) => {
    const res = await api.post("/v1/temple/sevas", data)
    return res.data
  },

  updateSeva: async (id: string, data: Partial<Seva>) => {
    const res = await api.put(`/v1/temple/sevas/${id}`, data)
    return res.data
  },

  deleteSeva: async (id: string) => {
    const res = await api.delete(`/v1/temple/sevas/${id}`)
    return res.data
  },

}


