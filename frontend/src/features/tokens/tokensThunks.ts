
import { createAsyncThunk } from "@reduxjs/toolkit"
import { tokensService } from "./tokensService"

export const fetchTokens = createAsyncThunk(
  "tokens/fetchTokens",
  async () => {
    return await tokensService.getTokens()
  }
)

export const fetchToken = createAsyncThunk(
  "tokens/fetchToken",
  async (id: string) => {
    return await tokensService.getToken(id)
  }
)

export const addToken = createAsyncThunk(
  "tokens/addToken",
  async (data: any) => {
    return await tokensService.addToken(data)
  }
)

export const updateToken = createAsyncThunk(
  "tokens/updateToken",
  async ({ id, data }: { id: string; data: any }) => {
    return await tokensService.updateToken(id, data)
  }
)

export const deleteToken = createAsyncThunk(
  "tokens/deleteToken",
  async (id: string) => {
    return await tokensService.deleteToken(id)
  }
)