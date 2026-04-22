import { createSlice } from "@reduxjs/toolkit"
import {
  fetchSevaBookings,
  deleteSevaBooking,
  cancelSevaBooking,
} from "./sevabookingThunks"

const initialState = {
  sevaBookings: [],
  loading: false,
}

const sevabookingSlice = createSlice({
  name: "sevabookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchSevaBookings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSevaBookings.fulfilled, (state, action) => {
        state.loading = false
        state.sevaBookings = action.payload
      })
      .addCase(fetchSevaBookings.rejected, (state) => {
        state.loading = false
      })

      .addCase(deleteSevaBooking.fulfilled, (state, action) => {
        state.sevaBookings = state.sevaBookings.filter(
          (item: any) => item.id !== action.payload
        )
      })

      // ✅ CANCEL UPDATE
      .addCase(cancelSevaBooking.fulfilled, (state, action) => {
        const updated = action.payload
        state.sevaBookings = state.sevaBookings.map((item: any) =>
          item.id === updated.id ? updated : item
        )
      })
  },
})

export default sevabookingSlice.reducer