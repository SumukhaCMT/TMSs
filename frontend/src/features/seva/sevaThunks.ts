

import { createAsyncThunk } from "@reduxjs/toolkit"
import { sevaService } from "./sevaService"

// Fetch all sevas
export const fetchSevas = createAsyncThunk(
  "seva/fetchSevas",
  async () => {
    return await sevaService.getSevas()
  }
)

// Fetch single seva by ID
export const fetchSeva = createAsyncThunk(
  "seva/fetchSeva",
  async (id: string) => {
    return await sevaService.getSeva(id)
  }
)

// Add a new seva with proper error handling
export const addSeva = createAsyncThunk(
  "seva/addSeva",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await sevaService.createSeva(data)
      return res
    } catch (err: any) {
      // Return backend error message (status 400, duplicates, etc)
      return rejectWithValue(err.response?.data)
    }
  }
)

// Update an existing seva
export const updateSeva = createAsyncThunk(
  "seva/updateSeva",
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const res = await sevaService.updateSeva(id, data)
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data)
    }
  }
)

// Delete a seva
export const deleteSeva = createAsyncThunk(
  "seva/deleteSeva",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await sevaService.deleteSeva(id)
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data)
    }
  }
)