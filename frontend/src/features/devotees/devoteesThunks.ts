import { createAsyncThunk } from "@reduxjs/toolkit"
import { devoteesService } from "./devoteesService"
import type { Devotees } from "@/types/Devotees"

export const fetchDevotees = createAsyncThunk(
  "devotees/fetchDevotees",
  async (_, { rejectWithValue }) => {
    try {
      return await devoteesService.getDevotees()
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchDevotee = createAsyncThunk(
  "devotees/fetchDevotee",
  async (id: string, { rejectWithValue }) => {
    try {
      return await devoteesService.getDevotee(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)

export const deleteDevotee = createAsyncThunk(
  "devotees/deleteDevotee",
  async (id: string, { rejectWithValue }) => {
    try {
      return await devoteesService.deleteDevotee(id)
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message)
    }
  }
)


//  ADD DEVOTEE (FIXED)
export const addDevotee = createAsyncThunk(
  "devotees/addDevotee",
  async (data: Partial<Devotees>, { rejectWithValue }) => {
    try {
      return await devoteesService.createDevotee(data)
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create devotee"
      )
    }
  }
)