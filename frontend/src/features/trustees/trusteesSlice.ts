import { createSlice } from "@reduxjs/toolkit"
import {
  fetchTrustees,
  fetchTrustee,
  addTrustee,
  updateTrustee,
  deleteTrustee
} from "./trusteesThunks"

const initialState = {
  trustees: [],
  trustee: null,
  loading: false,
  error: null as any
}

const trusteesSlice = createSlice({
  name: "trustees",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    // ✅ FETCH ALL
    builder.addCase(fetchTrustees.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(fetchTrustees.fulfilled, (state, action) => {
      state.loading = false
      state.trustees = action.payload
    })

    builder.addCase(fetchTrustees.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })


    // ✅ FETCH ONE
    builder.addCase(fetchTrustee.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(fetchTrustee.fulfilled, (state, action) => {
      state.loading = false
      state.trustee = action.payload
    })

    builder.addCase(fetchTrustee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })


    // ✅ ADD
    builder.addCase(addTrustee.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(addTrustee.fulfilled, (state, action) => {
      state.loading = false

      // 🔥 backend must return { data: {...} }
      if (action.payload?.data) {
        state.trustees.push(action.payload.data)
      }
    })

    builder.addCase(addTrustee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })


    // ✅ UPDATE
    builder.addCase(updateTrustee.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(updateTrustee.fulfilled, (state, action) => {
      state.loading = false

      const updated = action.payload?.data
      if (!updated) return

      const index = state.trustees.findIndex(
        (t: any) => t.id === updated.id
      )

      if (index !== -1) {
        state.trustees[index] = updated
      }

      state.trustee = updated
    })

    builder.addCase(updateTrustee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })


    // ✅ DELETE
    builder.addCase(deleteTrustee.pending, (state) => {
      state.loading = true
      state.error = null
    })

    builder.addCase(deleteTrustee.fulfilled, (state, action) => {
      state.loading = false

      state.trustees = state.trustees.filter(
        (t: any) => t.id !== action.payload
      )
    })

    builder.addCase(deleteTrustee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })
  }
})

export default trusteesSlice.reducer