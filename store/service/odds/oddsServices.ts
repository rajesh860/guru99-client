import type {
    BaseQueryFn,
    FetchBaseQueryError,
    FetchArgs} from "@reduxjs/toolkit/query/react";
  import {
    createApi,
    fetchBaseQuery
  } from "@reduxjs/toolkit/query/react";
import type { InplayRes, IpRes, matchedData, oddsResponse } from "./odds";

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("client-token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized responses
  // if (result.error && result.error.status === 401) {
  //   console.log("401 Unauthorized - Logging out user from oddsServices")
  //   localStorage.removeItem("client-token")
  //   localStorage.removeItem("user")
  //   localStorage.removeItem("userToken")
  //   localStorage.clear()
  //   window.location.href = "/login"
  //   return {
  //     error: {
  //       status: 401,
  //       data: { message: "Session expired. Please login again." }
  //     }
  //   }
  // }

  return result;
};
  
  export const oddsData = createApi({
    reducerPath: "oddsData",
    baseQuery: baseQueryWithAuth,
    endpoints: (build) => ({
      activeMatch: build.query<matchedData, void>({
        query: () => ({
          url: "/client/matches",
          method: "GET",
          
        }),
      }),
      inPlayMatch: build.query<InplayRes, void>({
        query: () => ({
          url: "/betfair_api/active_match",
          method: "GET",
          
        }),
      }),
      oddsData: build.query<oddsResponse, string | undefined>({
        query: (agrs) => ({
          // url: `/betfair_api/fancy/${agrs}`,
          url: `/betfair_api/fancy/bg/${agrs}`,
          method: "GET",
        }),
      }),
      
    }),
  });
  
  export const {
    useActiveMatchQuery,
    useOddsDataQuery,
    useInPlayMatchQuery
  } = oddsData;
  