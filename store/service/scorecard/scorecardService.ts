import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const scorecardApi = createApi({
  reducerPath: "scorecardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  endpoints: builder => ({
    getScorecard: builder.query({
      query: (eventId: string) => `/t10score?marketId=${eventId}`,
    }),
  }),
})

export const { useGetScorecardQuery } = scorecardApi
