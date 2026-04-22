import { createAsyncThunk } from "@reduxjs/toolkit"
import { deitiesService } from "./deitiesService"

export const fetchDeities = createAsyncThunk(
  "deities/fetchDeities",
  async () => {
    return await deitiesService.getDeities()
  }
)

export const deleteDeity = createAsyncThunk(
  "deities/deleteDeity",
  async (id: string) => {
    await deitiesService.deleteDeity(id)
    return id
  }
)

export const addDeities = createAsyncThunk(
  "deities/addDeities",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await deitiesService.addDeities(formData)
      return res
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add deity"
      )
    }
  }
)