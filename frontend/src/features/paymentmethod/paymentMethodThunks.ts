import { createAsyncThunk } from "@reduxjs/toolkit"
import { paymentMethodService } from "./paymentMethodService"

export const fetchPaymentMethods = createAsyncThunk(
  "paymentMethod/fetchPaymentMethods",
  async () => {
    return await paymentMethodService.getPaymentMethods()
  }
)

export const fetchPaymentMethod = createAsyncThunk(
  "paymentMethod/fetchPaymentMethod",
  async (id: string) => {
    return await paymentMethodService.getPaymentMethod(id)
  }
)

export const addPaymentMethod = createAsyncThunk(
  "paymentMethod/addPaymentMethod",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await paymentMethodService.createPaymentMethod(data)
      return res
    } catch (err: any) {
      // Return backend 400/duplicate error
      return rejectWithValue(err.response?.data)
    }
  }
)

export const updatePaymentMethod = createAsyncThunk(
  "paymentMethod/updatePaymentMethod",
  async ({ id, data }: any) => {
    return await paymentMethodService.updatePaymentMethod(id, data)
  }
)

export const deletePaymentMethod = createAsyncThunk(
  "paymentMethod/deletePaymentMethod",
  async (id: string) => {
    return await paymentMethodService.deletePaymentMethod(id)
  }
)