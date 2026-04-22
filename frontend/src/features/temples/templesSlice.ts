import { createSlice } from "@reduxjs/toolkit"
import {
  fetchTemples,
  fetchTempleById,
  createTemple,
  updateTemple,
  deleteTemple
} from "./templesThunks"

interface TempleState {
  temples: any[]
  temple: any | null
  loading: boolean
  error: any
}

const initialState: TempleState = {
  temples: [],
  temple: null,
  loading: false,
  error: null,
}

const templesSlice = createSlice({
  name: "temples",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    // 🔹 Fetch all temples
    builder
      .addCase(fetchTemples.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTemples.fulfilled, (state, action) => {
        state.loading = false
        state.temples = action.payload
      })
      .addCase(fetchTemples.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || "Failed to fetch temples"
      })

    // 🔹 Fetch single temple
    builder
      .addCase(fetchTempleById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTempleById.fulfilled, (state, action) => {
        state.loading = false
        state.temple = action.payload
      })
      .addCase(fetchTempleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // 🔹 Create temple
    builder.addCase(createTemple.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.temples.unshift(action.payload.data) // 👈 better UX (latest on top)
      }
    })

    // 🔹 Update temple
    builder.addCase(updateTemple.fulfilled, (state, action) => {
  const updated = action.payload?.data
  if (!updated) return

  const index = state.temples.findIndex(
    (t: any) => t.id === updated.id
  )

  if (index !== -1) {
    state.temples[index] = updated
  }

  state.temple = updated
})

    // 🔹 Delete temple
    builder.addCase(deleteTemple.fulfilled, (state, action) => {
      state.temples = state.temples.filter(
        (t: any) => t.id !== action.payload
      )
    })
  }
})

export default templesSlice.reducer