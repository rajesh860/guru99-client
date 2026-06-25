import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export const rouletteApi = createApi({
  reducerPath: "rouletteApi",
  baseQuery: dynamicBaseQuery as BaseQueryFn<
    string | { url: string; method: string; body?: any },
    unknown,
    FetchBaseQueryError
  >,
  endpoints: build => ({
    // Current round info + timer
    getRouletteCurrentRound: build.query<any, void>({
      query: () => ({ url: "/roulette/current-round", method: "GET" }),
    }),

    // Last N results (history bubbles)
    getRouletteResults: build.query<any, { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: `/roulette/results?limit=${limit}`,
        method: "GET",
      }),
    }),

    // Place a bet
    placeRouletteBet: build.mutation<any, { betType: string; betOn: string; stake: number }>({
      query: (body) => ({ url: "/roulette/bet", method: "POST", body }),
    }),

    // Pending (open) bets
    getRoulettePendingBets: build.query<any, void>({
      query: () => ({ url: "/roulette/pending-bets", method: "GET" }),
    }),

    // Completed / settled bets
    getRouletteCompletedBets: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/roulette/completed-bets?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useGetRouletteCurrentRoundQuery,
  useGetRouletteResultsQuery,
  usePlaceRouletteBetMutation,
  useGetRoulettePendingBetsQuery,
  useGetRouletteCompletedBetsQuery,
} = rouletteApi
