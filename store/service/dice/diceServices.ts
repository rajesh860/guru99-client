import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export const diceApi = createApi({
  reducerPath: "diceApi",
  baseQuery: dynamicBaseQuery as BaseQueryFn<
    string | { url: string; method: string; body?: any },
    unknown,
    FetchBaseQueryError
  >,
  endpoints: build => ({
    getDiceCurrentRound: build.query<any, void>({
      query: () => ({ url: "/dice/current-round", method: "GET" }),
    }),
    getDiceResults: build.query<any, void>({
      query: () => ({ url: "/dice/results", method: "GET" }),
    }),
    placeDiceBet: build.mutation<any, { betOn: string; stake: number }>({
      query: (body) => ({ url: "/dice/bet", method: "POST", body }),
    }),
    getDiceRoundSummary: build.query<any, void>({
      query: () => ({ url: "/dice/round-summary", method: "GET" }),
    }),
    getDicePendingBets: build.query<any, void>({
      query: () => ({ url: "/dice/pending-bets", method: "GET" }),
    }),
    getDiceCompletedBets: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: `/dice/completed-bets?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useGetDiceCurrentRoundQuery,
  useGetDiceResultsQuery,
  usePlaceDiceBetMutation,
  useGetDiceRoundSummaryQuery,
  useGetDicePendingBetsQuery,
  useGetDiceCompletedBetsQuery,
} = diceApi
