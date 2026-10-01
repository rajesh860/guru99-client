import type {
  BaseQueryFn,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { createApi } from "@reduxjs/toolkit/query/react"
import { dynamicBaseQuery } from "../dynamicBaseQuery"
import type {
  ActiveUserReq,
  ActiveUserRes,
  BetListLegdgerProps,
  BetListLegdgerRes,
  BetListReq,
  BetListRes,
  BetPlacedRes,
  BetplacedReq,
  TossBetReq,
  CasinoBetPlacePaylod,
  ChanelRes,
  ChangePaaReq,
  ChangePaaRes,
  FancyBookRes,
  LedgerBody,
  LedgerDataRes,
  LedgerDetailsReq,
  LedgerDetailsRes,
  LedgerListData,
  LedgerPaylod,
  LedgerReq,
  LogOutRes,

  OddsResponse,
  SessionPlusMinusRes,
  UserBalance,
  UserCreateBody,
  UserCreateRequestBody,
  UserCreateResBody,
  UserDetailsUpdateReq,
  UserDetailsUpdateRes,
  UserLiabilityData,
  UserLiabilityResponse,
  UserPassRequest,
  UserPassResponse,
  UserProfile,
  UserRequestBody,
  UserResponse,
  activeMatchRes,
  casinoResponse,
  channelReq,
  fancyBookreq,
  healthRes,
  mybetRequest,
  mybetResponce,
  rateDeffReq,
  rateDeffRes,
  useNameRequest,
  useNameRes,
} from "./user"

export const userList = createApi({
  reducerPath: "userList",
  baseQuery: dynamicBaseQuery as BaseQueryFn<
    string | { url: string; method: string; body?: any },
    unknown,
    FetchBaseQueryError
  >,
  endpoints: build => ({
    userList: build.mutation<UserResponse, UserRequestBody>({
      query: body => ({
        url: "/user/list-user",
        method: "POST",
        body,
      }),
    }),
    userName: build.mutation<useNameRes, useNameRequest>({
      query: body => ({
        url: "/user/username-id-search",
        method: "POST",
        body,
      }),
    }),
    userDetailForEdit: build.mutation<useNameRes, UserCreateRequestBody>({
      query: body => ({
        url: "/user/get-detail-for-user-creation",
        method: "POST",
        body,
      }),
    }),
    userCreate: build.mutation<UserCreateResBody, UserCreateBody>({
      query: body => ({
        url: "/user/create",
        method: "POST",
        body,
      }),
    }),
    userProfile: build.mutation<UserProfile, void>({
      query: () => ({
        url: "/wallet/user-info",
        method: "GET",
      }),
    }),
    ChangePassword: build.mutation<ChangePaaRes, ChangePaaReq>({
      query: body => ({
        url: "/user/changepassword-self",
        method: "POST",
        body,
      }),
    }),
    userDetailEdit: build.mutation<UserDetailsUpdateRes, UserDetailsUpdateReq>({
      query: body => ({
        url: "/user/user-detail-for-edit",
        method: "POST",
        body,
      }),
    }),
    userActive: build.mutation<ActiveUserRes, ActiveUserReq>({
      query: body => ({
        url: "/user/activate-deactivate-user",
        method: "POST",
        body,
      }),
    }),
    LedgerDepositWidthdraw: build.mutation<LedgerBody, LedgerPaylod>({
      query: body => ({
        url: "/ledger/ledger-dep-wid",
        method: "POST",
        body,
      }),
    }),
    LedgerDetails: build.mutation<LedgerDetailsRes, LedgerDetailsReq>({
      query: body => ({
        url: "/ledger/get-ledger-cash-trans-userid",
        method: "POST",
        body,
      }),
    }),
    LogOut: build.mutation<LogOutRes, void>({
      query: body => ({
        url: "/login/logout",
        method: "POST",
        body,
      }),
    }),
    userMessage: build.mutation<LogOutRes, void>({
      query: body => ({
        url: "/api/messages/active",
        method: "POST",
        body,
      }),
    }),
    betPlaced: build.mutation<BetPlacedRes, BetplacedReq>({
      query: body => ({
        url: "/bets/place",
        method: "POST",
        body,
      }),
    }),
    UpdateRate: build.mutation<rateDeffRes, rateDeffReq>({
      query: body => ({
        url: "/enduser/update-rate-difference",
        method: "POST",
        body,
      }),
    }),
    UserCahngePassword: build.mutation<UserPassResponse, UserPassRequest>({
      query: body => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
    getUserBalance: build.query<UserBalance, void>({
      query: () => ({
        url: "/wallet/user-info",
        method: "GET",
      }),
    }),
    healthCheck: build.mutation<healthRes, void>({
      query: () => ({
        url: `/health-check`,
        method: "GET",
      }),
    }),
    getSessionPlusMinus: build.query<SessionPlusMinusRes, BetListReq>({
      query: body => ({
        url: `/enduser/session-plus-minus-user-eventpage`,
        method: "POST",
        body,
      }),
    }),
    getLedgerDetails: build.mutation<LedgerDataRes, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/my-ledger?page=${page}&limit=${limit}&filter=group`,
        method: "GET",
      }),
    }),
    getLedgerBetDetails: build.mutation<LedgerListData, LedgerReq>({
      query: body => ({
        url: `/enduser/get-enduser-bet-detail`,
        method: "POST",
        body,
      }),
    }),
    getBettingProfitLoss: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/my-ledger?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getLedgerByBeventId: build.query<any, { beventId: string | number }>({
      query: ({ beventId }) => ({
        url: `/my-ledger/${beventId}`,
        method: "GET",
      }),
    }),
    getFancyBook: build.mutation<FancyBookRes, fancyBookreq>({
      query: body => ({
        url: `/enduser/fancy-book`,
        method: "POST",
        body,
      }),
    }),
    getCasinoBetPlaced: build.mutation<ChangePaaRes, CasinoBetPlacePaylod>({
      query: body => ({
        url: `/casino/bet-place`,
        method: "POST",
        body,
      }),
    }),
    getBetListLedger: build.mutation<BetListLegdgerRes, BetListLegdgerProps>({
      query: body => ({
        url: `/casino/bet-list-ledger`,
        method: "POST",
        body,
      }),
    }),
    getChanelId: build.mutation<ChanelRes, channelReq>({
      query: body => ({
        url: `/sports/channel-id-matchidwise`,
        method: "POST",
        body,
      }),
    }),
    activeEvent: build.mutation<any, any>({
      query: body => ({
        url: `/sports/active-event-list`,
        method: "POST",
        body,
      }),
    }),
    getTeamPL: build.query<any, { beventId: string }>({
      query: ({ beventId }) => ({
        url: `/client/bets/team-pl?beventId=${beventId}`,
        method: "GET",
      }),
    }),
    getFancyPnlByMatch: build.query<any, { userId: string; gmid: string }>({
      query: ({ userId, gmid }) => ({
        url: `/fancy-pnl-by-match?userId=${userId}&gmid=${gmid}`,
        method: "GET",
      }),
    }),
    getFancyBookData: build.query<any, { fancyId: string; beventId: string }>({
      query: ({ fancyId, beventId }) => ({
        url: `/fancy/book?fancyId=${fancyId}&beventId=${beventId}`,
        method: "GET",
      }),
    }),
    getCasinoMyBets: build.query<any, { game: string }>({
      query: ({ game }) => ({
        url: `/casino/my-bets?game=${game}`,
        method: "GET",
      }),
    }),
    getCasinoLedger: build.query<any, { game: string; date: string }>({
      query: ({ game, date }) => ({
        url: `/my-ledger/casino/${game}/${date}`,
        method: "GET",
      }),
    }),
    getMyBets: build.query<any, { betStatus: string; beventId: string }>({
      query: ({ betStatus, beventId }) => ({
        url: `/my-bets?betStatus=${betStatus}&beventId=${beventId}`,
        method: "GET",
      }),
    }),
    getCompletedBets: build.query<any, { beventId: string; page?: number; limit?: number }>({
      query: ({ beventId, page = 1, limit = 50 }) => ({
        url: `/my-bets/fancy-completed?beventId=${beventId}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getMessage: build.query<any, void>({
      query: () => ({
        url: "/messages/active",
        method: "GET",
      }),
    }),
    getPendingBets: build.query<any, void>({
      query: () => ({ url: "/pending-bets", method: "GET" }),
    }),
    getCasinoGameData: build.query<any, { game: string }>({
      query: ({ game }) => ({ url: `/casino/data/${game}`, method: "GET" }),
    }),
    getCasinoCompletedBets: build.query<any, { game: string; fromDate?: string; toDate?: string; page?: number; limit?: number }>({
      query: ({ game, fromDate, toDate, page = 1, limit = 20 }) => {
        const params = new URLSearchParams({ game, page: String(page), limit: String(limit) })
        if (fromDate) params.set("fromDate", fromDate)
        if (toDate) params.set("toDate", toDate)
        return { url: `/casino/completed-bets?${params.toString()}`, method: "GET" }
      },
    }),
    getCasinoRoundPl: build.query<any, { game: string; roundId: string }>({
      query: ({ game, roundId }) => ({
        url: `/casino/round-pl?game=${game}&roundId=${roundId}`,
        method: "GET",
      }),
    }),

    getAccStatement: build.mutation<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/my-ledger-by-event/?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    completedMatch: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/my-ledger-by-event/?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getAccountStatement: build.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/account-statement?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    tossBetPlaced: build.mutation<BetPlacedRes, TossBetReq>({
      query: body => ({
        url: "/toss/bet",
        method: "POST",
        body,
      }),
    }),
    aviatorPlaceBet: build.mutation<any, { stake: number; roundId: string; autoCashout?: number }>({
      query: body => ({ url: "/aviator/bet", method: "POST", body }),
    }),
    aviatorCashout: build.mutation<any, { betId: string; roundId?: string }>({
      query: body => ({ url: "/aviator/cashout", method: "POST", body }),
    }),
    aviatorPendingBets: build.query<any, void>({
      query: () => ({ url: "/aviator/pending-bets", method: "GET" }),
    }),
    aviatorCompletedBets: build.query<any, void>({
      query: () => ({ url: "/aviator/completed-bets", method: "GET" }),
    }),
    aviatorCurrentRound: build.query<any, void>({
      query: () => ({ url: "/aviator/current-round", method: "GET" }),
    }),
    aviatorResults: build.query<any, void>({
      query: () => ({ url: "/aviator/results", method: "GET" }),
    }),
  }),
})

export const {
  useUserListMutation,
  useUserNameMutation,
  useUserDetailForEditMutation,
  useUserCreateMutation,
  useUserProfileMutation,
  useChangePasswordMutation,
  useUserDetailEditMutation,
  useUserActiveMutation,
  useLedgerDepositWidthdrawMutation,
  useLedgerDetailsMutation,
  useLogOutMutation,
  useUserMessageMutation,
  useBetPlacedMutation,
  useUpdateRateMutation,
  useUserCahngePasswordMutation,
  useGetUserBalanceQuery,
  useHealthCheckMutation,
  useGetLedgerDetailsMutation,
  useGetLedgerBetDetailsMutation,
  useGetLedgerByBeventIdQuery,
  useGetBettingProfitLossQuery,
  useGetSessionPlusMinusQuery,
  useGetFancyBookMutation,
  useGetCasinoBetPlacedMutation,
  useGetBetListLedgerMutation,

  useGetChanelIdMutation,
  useActiveEventMutation,
  useGetTeamPLQuery,
  useGetFancyPnlByMatchQuery,
  useGetFancyBookDataQuery,
  useGetCasinoMyBetsQuery,
  useGetCasinoLedgerQuery,
  useGetMyBetsQuery,
  useGetCompletedBetsQuery,
  useGetMessageQuery,
  useGetAccStatementMutation,
  useGetAccountStatementQuery,
  useCompletedMatchQuery,
  useTossBetPlacedMutation,
  useGetPendingBetsQuery,
  useGetCasinoCompletedBetsQuery,
  useGetCasinoRoundPlQuery,
  useGetCasinoGameDataQuery,
  useAviatorPlaceBetMutation,
  useAviatorCashoutMutation,
  useAviatorPendingBetsQuery,
  useAviatorCompletedBetsQuery,
  useAviatorCurrentRoundQuery,
  useAviatorResultsQuery,
} = userList
