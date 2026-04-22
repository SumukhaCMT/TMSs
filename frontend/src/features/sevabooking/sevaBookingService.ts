

import api from "@/axios/axios"
import type { SevaBooking } from "@/types/SevaBooking"

export const sevaBookingService = {
  getSevaBookings: async () => {
    const res = await api.get("/v1/temple/seva-bookings")
    return res.data.data
  },

  getSevaBooking: async (id: string) => {
    const res = await api.get(`/v1/temple/seva-bookings/${id}`)
    return res.data.data
  },

  createSevaBooking: async (data: Partial<SevaBooking>) => {
    const res = await api.post("/v1/temple/seva-bookings", data)
    return res.data.data
  },

  updateSevaBooking: async (id: string, data: Partial<SevaBooking>) => {
    const res = await api.put(`/v1/temple/seva-bookings/${id}`, data)
    return res.data.data
  },

  deleteSevaBooking: async (id: string) => {
    await api.delete(`/v1/temple/seva-bookings/${id}`)
    return id
  },

  cancelSevaBooking: async (id: string, data: any) => {
    const res = await api.put(
      `/v1/temple/seva-bookings/${id}/cancel`,
      data
    )
    return res.data.data
  },
}