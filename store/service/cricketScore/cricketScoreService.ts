import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export const cricketScoreApi = createApi({
  reducerPath: "cricketScoreApi",
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getLiveCricketScore: builder.query({
      query: (beventId: string) => `/cricket-scores/live?beventId=${beventId}`,
    }),
    getBallFeeds: builder.query<any[], { matchKey: string; lastDocId?: string | null }>({
      queryFn: async ({ matchKey, lastDocId = null }) => {
        try {
          const response = await fetch(
            'https://content.crickapi.com/commentary/v1/getBallFeeds',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ matchKey, lastDocId, filters: {} }),
            }
          )
          if (!response.ok) throw new Error(`HTTP ${response.status}`)
          const data = await response.json()
          return { data: Array.isArray(data) ? data : [] }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } }
        }
      },
    }),
  }),
})

export const { useGetLiveCricketScoreQuery, useGetBallFeedsQuery } = cricketScoreApi
