import type { BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"

export const ludoApi = createApi({
  reducerPath: "ludoApi",
  baseQuery: dynamicBaseQuery as BaseQueryFn<
    string | { url: string; method: string; body?: any },
    unknown,
    FetchBaseQueryError
  >,
  endpoints: build => ({
    getLudoTables: build.query<any, void>({
      query: () => ({ url: "/ludo/tables", method: "GET" }),
    }),
    playLudoGame: build.mutation<any, number>({
      query: (entryFee) => ({ url: "/ludo/play", method: "POST", body: { entryFee } }),
    }),
    getLudoGame: build.query<any, string>({
      query: (gameId) => ({ url: `/ludo/game/${gameId}`, method: "GET" }),
    }),
    cancelLudoRoom: build.mutation<any, string>({
      query: (roomId) => ({ url: `/ludo/room/cancel/${roomId}`, method: "POST" }),
    }),
    exitLudoGame: build.mutation<any, string>({
      query: (gameId) => ({ url: `/ludo/game/exit/${gameId}`, method: "POST" }),
    }),
    createLudoRoom: build.mutation<any, number>({
      query: (entryFee) => ({ url: "/ludo/room/create", method: "POST", body: { entryFee } }),
    }),
  }),
})

export const {
  useGetLudoTablesQuery,
  usePlayLudoGameMutation,
  useGetLudoGameQuery,
  useCancelLudoRoomMutation,
  useCreateLudoRoomMutation,
  useExitLudoGameMutation,
} = ludoApi
