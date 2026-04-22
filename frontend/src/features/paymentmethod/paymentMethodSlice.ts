import { createSlice } from "@reduxjs/toolkit"
import {
  fetchPaymentMethods,
  fetchPaymentMethod,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from "./paymentMethodThunks"

const initialState = {
  paymentMethods: [],
  paymentMethod: null,
  loading: false,
}

const paymentMethodSlice = createSlice({
  name: "paymentMethod",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder.addCase(fetchPaymentMethods.pending, (state) => {
      state.loading = true
    })

    builder.addCase(fetchPaymentMethods.fulfilled, (state, action) => {
      state.loading = false
      state.paymentMethods = action.payload
    })

    builder.addCase(fetchPaymentMethod.pending, (state) => {
      state.loading = true
    })

    builder.addCase(fetchPaymentMethod.fulfilled, (state, action) => {
      state.loading = false
      state.paymentMethod = action.payload
    })

    builder.addCase(addPaymentMethod.fulfilled, (state, action) => {
      state.paymentMethods.push(action.payload)
    })

    builder.addCase(deletePaymentMethod.fulfilled, (state, action) => {
      state.paymentMethods = state.paymentMethods.filter(
        (p: any) => p.id !== action.payload
      )
    })

    builder.addCase(updatePaymentMethod.fulfilled, (state, action) => {

      const updated = action.payload.data

      const index = state.paymentMethods.findIndex(
        (p: any) => p.id === updated.id
      )

      if (index !== -1) {
        state.paymentMethods[index] = updated
      }

      state.paymentMethod = updated
    })

  }
})

export default paymentMethodSlice.reducer