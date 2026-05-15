import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { dynamicBaseQuery } from './dynamicBaseQuery';

interface BetData {
  game: string;
  roundId: string;
  sid: string;
  stake: number;
  betType: string;
}

interface TeenPattiResult {
  roundId: string;
  winner: string;
  cards: any[];
  timestamp: string;
}

interface Teen20ResultResponse {
  success: boolean;
  game: string;
  updatedAt: string;
  result: {
    success: boolean;
    data: Array<{
      result: string;
      mid: string;
    }>;
  };
}

interface RoundDetailResponse {
  success: boolean;
  game: string;
  roundId: string;
  winner: string;
  settledAt: string;
  cards: {
    "Player A": string[];
    "Player B": string[];
  };
  desc: string[];
  myBets: Array<{
    _id: string;
    betOn: string;
    odds: number;
    stake: number;
    betType: string;
    status: string;
    profitLoss: number;
  }>;
  totalProfit: number;
}

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Check if this is the placeCasinoBet, getRoundDetail, or getTeenPattiResults endpoint
  if (typeof args === 'object' && (
    args.url === '/casino/bet' || 
    args.url?.startsWith('/casino/round/') || 
    args.url?.startsWith('/result/')
  )) {
    // Use dynamicBaseQuery for these endpoints
    return dynamicBaseQuery(args, api, extraOptions);
  }
  
  // Use regular baseQuery for other endpoints
  const baseQuery = fetchBaseQuery({
    baseUrl: 'http://13.126.43.239:3000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });
  
  return baseQuery(args, api, extraOptions);
};

export const teenPattiApi = createApi({
  reducerPath: 'teenPattiApi',
  baseQuery: customBaseQuery,
  
  endpoints: (builder) => ({
    getTeenPattiData: builder.query<any, void>({
      query: () => ({
        url: '/data/teen20',
        method: 'GET',
      }),
    }),
    getTeenPattiResults: builder.query<Teen20ResultResponse, void>({
      query: () => ({
        url: '/result/teen20',
        method: 'GET',
      }),
    }),
    getDetailResult: builder.query<any, string>({
      query: (roundId: string) => ({
        url: `/getdetailresult/${roundId}`,
        method: 'GET',
      }),
    }),
    getRoundDetail: builder.query<RoundDetailResponse, { game: string; roundId: string }>({
      query: ({ game, roundId }) => ({
        url: `/casino/round/${game}/${roundId}/my-bets`,
        method: 'GET',
      }),
    }),
    placeCasinoBet: builder.mutation<any, BetData>({
      query: (betData: BetData) => ({
        url: '/casino/bet',
        method: 'POST',
        body: betData,
      }),
    }),
  }),
});

export const { 
  useGetTeenPattiDataQuery, 
  useGetTeenPattiResultsQuery,
  useGetDetailResultQuery,
  useGetRoundDetailQuery,
  usePlaceCasinoBetMutation 
} = teenPattiApi;
