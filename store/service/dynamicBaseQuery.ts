import {fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import {type BaseQueryFn, type FetchArgs,type FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import snackbarUtil from "../../src/utils/Snackbar";

interface ErrorResponse {
  message: string;
}

function isErrorResponse(data: any): data is ErrorResponse {
  return data && typeof data.message === 'string';
}

export const dynamicBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("client-token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await rawBaseQuery(args, api, extraOptions as FetchBaseQueryMeta);
  if (result?.error) {
    const status = result.error.status;
    
    // Handle 401 Unauthorized - Auto logout and redirect
    if (status === 401) {
      console.log("401 Unauthorized - Logging out user from dynamicBaseQuery")
      localStorage.removeItem("client-token")
      localStorage.removeItem("user")
      localStorage.removeItem("userToken")
      localStorage.clear()
      window.location.href = "/login"
      return {
        error: {
          status: 401,
          data: { message: "Session expired. Please login again." }
        }
      }
    }
    
    // Handle 400 Bad Request
    if (status === 400) {
      const errorData = result.error.data;
      if (isErrorResponse(errorData)) {
        snackbarUtil.error(errorData.message);
      } else {
        snackbarUtil.error('An unexpected error occurred.');
      }
    }
  }
  return result;
};
