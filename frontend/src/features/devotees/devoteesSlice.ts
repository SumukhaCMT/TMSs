import { createSlice } from "@reduxjs/toolkit"
import {
  fetchDevotees,
  fetchDevotee,
  deleteDevotee,
  addDevotee
} from "./devoteesThunks"

interface DevoteesState {
  devotees: any[]
  devotee: any | null
  loading: boolean
  error: string | null
}

const initialState: DevoteesState = {
  devotees: [],
  devotee: null,
  loading: false,
  error: null,
}

const devoteesSlice = createSlice({
  name: "devotees",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH LIST
      .addCase(fetchDevotees.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchDevotees.fulfilled, (state, action) => {
        state.loading = false
        state.devotees = action.payload
      })
      .addCase(fetchDevotees.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload
      })

      // FETCH SINGLE
      .addCase(fetchDevotee.fulfilled, (state, action) => {
        state.devotee = action.payload
      })

      // DELETE
      .addCase(deleteDevotee.fulfilled, (state, action) => {
        state.devotees = state.devotees.filter(
          (d: any) => d.id !== action.payload
        )
      })

      
      .addCase(addDevotee.fulfilled, (state, action) => {
        state.devotees.push(action.payload) //  correct
      }
        )
      
  },
})

export default devoteesSlice.reducer