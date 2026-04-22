import { createAsyncThunk } from "@reduxjs/toolkit"
import { templeService } from "./templesService"

export const fetchTemples = createAsyncThunk(
  "temples/fetchAll",
  async () => {
    return await templeService.getTemples()
  }
)

export const fetchTempleById = createAsyncThunk(
  "temples/fetchById",
  async (id: string) => await templeService.getTemple(id)
)

export const createTemple = createAsyncThunk(
  "temples/create",
  async (data: any) => await templeService.createTemple(data)
)

export const updateTemple = createAsyncThunk(
  "temples/update",
  async ({ id, data }: any) =>
    await templeService.updateTemple(id, data)
)

export const deleteTemple = createAsyncThunk(
  "temples/delete",
  async (id: string) => {
    await templeService.deleteTemple(id)
    return id
  }
)