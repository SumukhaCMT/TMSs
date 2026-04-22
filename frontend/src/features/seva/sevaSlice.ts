import { createSlice } from "@reduxjs/toolkit"
import {
  fetchSevas,
  fetchSeva,
  addSeva,
  updateSeva,
  deleteSeva
} from "./sevaThunks"

const initialState = {
  sevas: [],
  seva: null,
    
  loading: false,
}

const sevaSlice = createSlice({
  name: "seva",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    builder.addCase(fetchSevas.pending, (state) => {
      state.loading = true
    })

    builder.addCase(fetchSevas.fulfilled, (state, action) => {
      state.loading = false
      state.sevas = action.payload
    })

   
    builder.addCase(fetchSeva.pending, (state) => {
    state.loading = true
      })

      builder.addCase(fetchSeva.fulfilled, (state, action) => {
        state.loading = false
        state.seva = action.payload
      })

    builder.addCase(addSeva.fulfilled, (state, action) => {
      state.sevas.push(action.payload)
    })

    builder.addCase(deleteSeva.fulfilled, (state, action) => {
      state.sevas = state.sevas.filter(
        (s: any) => s.id !== action.payload
      )
    })
    builder.addCase(updateSeva.fulfilled, (state, action) => {
    const index = state.sevas.findIndex(  
      (s: any) => s.id === action.payload.data.id
    )

      if (index !== -1) {
        state.sevas[index] = action.payload.data
      }

      state.seva = action.payload.data
    })
            

  }
})

export default sevaSlice.reducer