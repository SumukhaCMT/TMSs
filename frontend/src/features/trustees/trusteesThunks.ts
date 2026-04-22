import { createAsyncThunk } from "@reduxjs/toolkit"
import { trusteesService } from "./trusteesService"

// Get all
export const fetchTrustees = createAsyncThunk(
  "trustees/fetchTrustees",
  async () => {
    return await trusteesService.getTrustees()
  }
)

// Get one
export const fetchTrustee = createAsyncThunk(
  "trustees/fetchTrustee",
  async (id: string) => {
    return await trusteesService.getTrustee(id)
  }
)

// Create
export const addTrustee = createAsyncThunk(
  "trustees/addTrustee",
  async (data: any, { rejectWithValue }) => {
    try {
      return await trusteesService.createTrustee(data)
    } catch (err: any) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// Update
export const updateTrustee = createAsyncThunk(
  "trustees/updateTrustee",
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      return await trusteesService.updateTrustee(id, data)
    } catch (err: any) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// Delete
export const deleteTrustee = createAsyncThunk(
  "trustees/deleteTrustee",
  async (id: string, { rejectWithValue }) => {
    try {
      await trusteesService.deleteTrustee(id)
      return id
    } catch (err: any) {
      return rejectWithValue(err.response?.data)
    }
  }
)