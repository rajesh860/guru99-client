import type {
  BaseQueryFn,
  FetchBaseQueryError,
  FetchArgs,
} from "@reduxjs/toolkit/query/react"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const baseQueryWithDynamicUrl: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let rawUrl = typeof args === "string" ? args : args.url

  const useMainApi =
    rawUrl.includes("/casino/bet-place") ||
    rawUrl.includes("/casino/stream")

  const selectedBaseQuery = fetchBaseQuery({
    baseUrl: useMainApi
      ? import.meta.env.VITE_API_BASE_URL
      : import.meta.env.VITE_ODDS_API,
    prepareHeaders: headers => {
      const token = localStorage.getItem("client-token")
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  })

  const result = await selectedBaseQuery(args, api, extraOptions)

  // Handle 401 Unauthorized responses
  // if (result.error && result.error.status === 401) {
  //   console.log("401 Unauthorized - Logging out user")
  //   
  //   // Clear all auth tokens and user data
  //   localStorage.removeItem("client-token")
  //   localStorage.removeItem("user")
  //   localStorage.removeItem("userToken")
  //   localStorage.clear() // Clear all localStorage data
  //   
  //   // Redirect to login page
  //   window.location.href = "/login"
  //   
  //   return {
  //     error: {
  //       status: 401,
  //       data: { message: "Session expired. Please login again." }
  //     }
  //   }
  // }

  return result
}

export const casinoData = createApi({
  reducerPath: "casinoData",
  baseQuery: baseQueryWithDynamicUrl,
  endpoints: build => ({
    getCasinoResultByRoundId: build.mutation<CasinoResponse, void>({
      query: arge => ({
        url: `/betfair_api/casino/result-round-id-wise/${arge}`,
        method: "GET",
      }),
    }),
    teenPatti20: build.query<any, string>({
      query: (arg) => ({
        url: `/betfair_api/casino/data/meta-${arg}`,
        method: "GET",
      }),
    }),
    betPlace: build.mutation<any, any>({
      query: body => ({
        url: `/casino/bet-place`,
        method: "POST",
        body,
      }),
    }),
    andarBharCasino: build.query<any, any>({
      query: body => ({
        url: `/betfair_api/casino/data/meta-ab20`,
        method: "GET",
        body,
      }),
    }),
    getCasinoStream: build.query<any, { game: string }>({
      query: ({ game }) => ({
        url: `/casino/stream?game=${game}`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useAndarBharCasinoQuery,
  useBetPlaceMutation,
  useTeenPatti20Query,
  useGetCasinoResultByRoundIdMutation,
  useGetCasinoStreamQuery,
} = casinoData
