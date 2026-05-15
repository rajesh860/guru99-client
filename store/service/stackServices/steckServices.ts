// https://adminapi.247idhub.com/admin-new-apis/enduser/get-stake-button


import type {
    BaseQueryFn,
    FetchBaseQueryError,
    FetchArgs} from "@reduxjs/toolkit/query/react";
  import {
    createApi,
    fetchBaseQuery
  } from "@reduxjs/toolkit/query/react";
import type { stackRes } from "../odds/odds";

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: "https://adminapi.247idhub.com/admin-new-apis",
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
  //   console.log("401 Unauthorized - Logging out user from stackServices")
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
  
  export const stackData = createApi({
    reducerPath: "stackData",
    baseQuery: baseQueryWithAuth,
    endpoints: (build) => ({
      getStackValue: build.query<stackRes, void>({
        query: () => ({
          url: "/enduser/get-stake-button",
          method: "GET",
          
        }),
      }),
    }),
  });
  
  export const {
    useGetStackValueQuery,
  } = stackData;
  