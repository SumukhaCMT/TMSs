// src/features/tokens/tokensSlice.ts
import { createSlice } from "@reduxjs/toolkit"
import {
  fetchTokens,
  fetchToken,
  addToken,
  updateToken,
  deleteToken
} from "./tokensThunks"

const initialState = {
  tokens: [],
  token: null,
  loading: false,
}

const tokensSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {},

  extraReducers: (builder) => {

    // FETCH ALL
    builder.addCase(fetchTokens.pending, (state) => {
      state.loading = true
    })

    builder.addCase(fetchTokens.fulfilled, (state, action) => {
      state.loading = false
      state.tokens = action.payload
    })

    // FETCH ONE
    builder.addCase(fetchToken.pending, (state) => {
      state.loading = true
    })

    builder.addCase(fetchToken.fulfilled, (state, action) => {
      state.loading = false
      state.token = action.payload
    })

    // ADD
    builder.addCase(addToken.fulfilled, (state, action) => {
      state.tokens.push(action.payload)
    })

    // DELETE
    builder.addCase(deleteToken.fulfilled, (state, action) => {
      state.tokens = state.tokens.filter(
        (t: any) => t.id !== action.payload
      )
    })

    // UPDATE
    builder.addCase(updateToken.fulfilled, (state, action) => {

      const index = state.tokens.findIndex(
        (t: any) => t.id === action.payload.data.id
      )

      if (index !== -1) {
        state.tokens[index] = action.payload.data
      }

      state.token = action.payload.data
    })
  }
})

export default tokensSlice.reducer