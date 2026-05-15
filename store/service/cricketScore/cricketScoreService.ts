import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export const cricketScoreApi = createApi({
  reducerPath: "cricketScoreApi",
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getLiveCricketScore: builder.query({
      query: (beventId: string) => `/cricket-scores/live?beventId=${beventId}`,
    }),
  }),
})

export const { useGetLiveCricketScoreQuery } = cricketScoreApi
