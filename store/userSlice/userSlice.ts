import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

type UserState = {
  usedCoin: number,
  sessionPlusMinus: number,
}

const initialState: UserState = {
  usedCoin: 0,
  sessionPlusMinus: 0,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsedCoin: (state, action: PayloadAction<number | null | undefined>) => {
      state.usedCoin = action.payload
    },
    setSessionPlusMinus: (state, action: PayloadAction<number | null | undefined>) => {
      state.sessionPlusMinus = action.payload
    },
  },
})

export const { setUsedCoin, setSessionPlusMinus } = userSlice.actions
export default userSlice.reducer
