import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export type MatkaListItem = any
export type MatkaMarketResponse = any
export type MatkaBetsResponse = any

export const matkaApi = createApi({
  reducerPath: "matkaApi",
    baseQuery: dynamicBaseQuery as BaseQueryFn<
      string | { url: string; method: string; body?: any },
      unknown,
      FetchBaseQueryError
    >,
  endpoints: build => ({
    getMatkaList: build.query<MatkaListItem, void>({
      query: () => ({
        url: "/matka/list",
        method: "POST",
        body: {},
      }),
    }),
    getMatkaMarket: build.mutation<MatkaMarketResponse, { matkaId: number }>({
      query: body => ({
        url: "/matka/get-matka-market",
        method: "POST",
        body,
      }),
    }),
    getMatkaLiability: build.mutation<any, { matchId: number; marketId: string }>({
      query: body => ({
        url: "/matka/get-matka-liability",
        method: "POST",
        body,
      }),
    }),
    getMatkaBets: build.mutation<MatkaBetsResponse, { matchId: number; marketId?: number; typeId?: number }>({
      query: body => ({
        url: "/matka/get-matka-bets",
        method: "POST",
        body,
      }),
    }),
    placeMatkaBet: build.mutation<any, any>({
      query: body => ({
        url: "/matka/bet",
        method: "POST",
        body,
      }),
    }),
    getMatkaMarkets: build.query<any, void>({
      query: () => ({
        url: "/matka/markets",
        method: "GET",
      }),
    }),
    getMyMatkaBets: build.query<any, { market?: string; eventId?: string; betType?: string; status?: string; page?: number; limit?: number }>({
      query: ({ market, eventId, betType, status, page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams()
        if (market)  params.append("market",  market)
        if (eventId) params.append("eventId", eventId)
        if (betType) params.append("betType", betType)
        if (status)  params.append("status",  status)
        params.append("page",  String(page))
        params.append("limit", String(limit))
        return { url: `/matka/my-bets?${params.toString()}`, method: "GET" }
      },
    }),
    getMyJodiGrid: build.query<any, { market: string; eventId: string | number }>({
      query: ({ market, eventId }) => ({
        url: `/matka/my-jodi-grid?market=${market}&eventId=${eventId}`,
        method: "GET",
      }),
    }),
    getMyHarufGrid: build.query<any, { market: string; eventId: string | number }>({
      query: ({ market, eventId }) => ({
        url: `/matka/my-haruf-grid?market=${market}&eventId=${eventId}`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useGetMatkaListQuery,
  useGetMatkaMarketMutation,
  useGetMatkaBetsMutation,
  useGetMatkaLiabilityMutation,
  usePlaceMatkaBetMutation,
  useGetMatkaMarketsQuery,
  useGetMyMatkaBetsQuery,
  useGetMyJodiGridQuery,
  useGetMyHarufGridQuery,
} = matkaApi
