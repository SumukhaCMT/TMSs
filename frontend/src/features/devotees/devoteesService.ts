import api from "@/axios/axios"
import type { Devotees } from "@/types/Devotees"

export const devoteesService = {
  getDevotees: async () => {
    const res = await api.get("/v1/temple/devotees")
    return res.data.data
  },

  getDevotee: async (id: string) => {
    const res = await api.get(`/v1/temple/devotees/${id}`)
    return res.data.data
  },

  createDevotee: async (data: Partial<Devotees>) => {
    const res = await api.post("/v1/temple/devotees", data)
    return res.data.data
  },

  updateDevotee: async (id: string, data: Partial<Devotees>) => {
    const res = await api.put(`/v1/temple/devotees/${id}`, data)
    return res.data.data
  },

  deleteDevotee: async (id: string) => {
    await api.delete(`/v1/temple/devotees/${id}`)
    return id
  },

  
}