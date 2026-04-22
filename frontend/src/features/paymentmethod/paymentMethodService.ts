import api from "@/axios/axios"
import type  PaymentMethod  from "@/types/PaymentMethod"

export const paymentMethodService = {

  getPaymentMethods: async () => {
    const res = await api.get("/v1/temple/payment-methods")
    return res.data.data
  },

  getPaymentMethod: async (id: string) => {
    const res = await api.get(`/v1/temple/payment-methods/${id}`)
    return res.data.data
  },

  createPaymentMethod: async (data: Partial<PaymentMethod>) => {
    const res = await api.post("/v1/temple/payment-methods", data)
    return res.data
  },

  updatePaymentMethod: async (id: string, data: Partial<PaymentMethod>) => {
    const res = await api.put(`/v1/temple/payment-methods/${id}`, data)
    return res.data
  },

  deletePaymentMethod: async (id: string) => {
    const res = await api.delete(`/v1/temple/payment-methods/${id}`)
    return res.data
  },

}