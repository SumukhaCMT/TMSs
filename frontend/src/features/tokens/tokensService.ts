import api from "@/axios/axios"

import type {Tokens} from "@/types/Tokens"


export const tokensService = {
    getTokens: async () => {
    const res = await api.get("/v1/temple/tokens")
    return res.data.data
  },

  getToken: async (id: string) => {
    const res = await api.get(`/v1/temple/tokens/${id}`)
    return res.data.data
  },

  addToken: async (data: Partial<Tokens>) => {
    const res = await api.post("/v1/temple/tokens", data)
    return res.data
  },

  updateToken: async (id: string, data: Partial<Tokens>) => {
    const res = await api.put(`/v1/temple/tokens/${id}`, data)
    return res.data
  },

  deleteToken: async (id: string) => {
    const res = await api.delete(`/v1/temple/tokens/${id}`)
    return res.data
  },

}