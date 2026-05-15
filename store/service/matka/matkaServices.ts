import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
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
    getMyMatkaBets: build.query<any, void>({
      query: () => ({
        url: "/matka/my-bets",
        method: "GET",
      }),
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
