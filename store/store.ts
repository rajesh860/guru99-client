import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./service/authService"
import { userList } from "./service/userServices/userServices"
import { oddsData } from "./service/odds/oddsServices"
import { stackData } from "./service/stackServices/steckServices"
import global from "./global/slice"
import { casinoData } from "./service/casino/casinoServices"
import userReducer from "./userSlice/userSlice"
import { matkaApi } from "./service/matka/matkaServices"
import { teenPattiApi } from "./service/teenPattiApi"
import { scorecardApi } from "./service/scorecard/scorecardService"
import { cricketScoreApi } from "./service/cricketScore/cricketScoreService"

export const store = configureStore({
  reducer: {
    global,
    user: userReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userList.reducerPath]: userList.reducer,
    [oddsData.reducerPath]: oddsData.reducer,
    [stackData.reducerPath]: stackData.reducer,
    [casinoData.reducerPath]: casinoData.reducer,
    [matkaApi.reducerPath]: matkaApi.reducer,
    [teenPattiApi.reducerPath]: teenPattiApi.reducer,
    [scorecardApi.reducerPath]: scorecardApi.reducer,
    [cricketScoreApi.reducerPath]: cricketScoreApi.reducer,
  },
  middleware: defaultMiddleware =>
    defaultMiddleware()
      .concat(authApi.middleware)
      .concat(userList.middleware)
      .concat(oddsData.middleware)
      .concat(stackData.middleware)
      .concat(casinoData.middleware)
      .concat(matkaApi.middleware)
      .concat(teenPattiApi.middleware)
      .concat(scorecardApi.middleware)
      .concat(cricketScoreApi.middleware),
})
