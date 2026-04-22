import { createSlice } from "@reduxjs/toolkit"
import { fetchDeities, deleteDeity, addDeities } from "./deitiesThunk"


interface DeitiesState {
  deities: any[]
  loading: boolean
}

const initialState: DeitiesState = {
  deities: [],
  loading: false,
}

const deitiesSlice = createSlice({
  name: "deities",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDeities.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchDeities.fulfilled, (state, action) => {
        state.loading = false
        state.deities = action.payload
      })

      .addCase(fetchDeities.rejected, (state) => {
        state.loading = false
      })

      .addCase(deleteDeity.fulfilled, (state, action) => {
        state.deities = state.deities.filter(
          (d) => d.id !== action.payload
        )
      })
       // ADD
      .addCase(addDeities.fulfilled, (state, action) => {
        state.deities.push(action.payload)
      })
  },
})

export default deitiesSlice.reducer