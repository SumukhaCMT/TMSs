// sevabookingThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit"
import { sevaBookingService } from "./sevaBookingService"

export const fetchSevaBookings = createAsyncThunk(
  "sevaBookings/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await sevaBookingService.getSevaBookings()
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)

export const deleteSevaBooking = createAsyncThunk(
  "sevaBookings/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      return await sevaBookingService.deleteSevaBooking(id)
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)

export const cancelSevaBooking = createAsyncThunk(
  "sevaBookings/cancel",
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      return await sevaBookingService.cancelSevaBooking(id, data)
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message)
    }
  }
)