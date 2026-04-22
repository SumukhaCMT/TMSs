import { configureStore } from "@reduxjs/toolkit"
import sevaReducer from "@/features/seva/sevaSlice"
import paymentMethodReducer from "@/features/paymentmethod/paymentMethodSlice"
import deitiesReducer from "@/features/deities/deitiesSlice"
import devoteesReducer from "@/features/devotees/devoteesSlice"
import sevabookingReducer from  "@/features/sevabooking/sevaBookingSlice"
import templesReducer from "@/features/temples/templesSlice"
import tokensReducer from "@/features/tokens/tokensSlice"
import trusteesReducer from "@/features/trustees/trusteesSlice"


export const store = configureStore({
  reducer: {
    seva: sevaReducer,
    paymentMethod: paymentMethodReducer,
    deities: deitiesReducer,
    devotees: devoteesReducer,
    sevabookings: sevabookingReducer, 
     temples: templesReducer,
      tokens: tokensReducer,
       trustees: trusteesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch