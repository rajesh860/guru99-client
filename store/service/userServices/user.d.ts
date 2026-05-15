interface UserRequestBody {
  userType: number
  noOfRecords: number
  index: number
}

interface UserList {
  userId: string
  userName: string
  mobile: string
  password: string
  balance: number
  matchCommission: number
  sessionCommission: number
  share: number
  userStatus: boolean
  parentId: string
}
interface UserResponse {
  data: UserList[]
}

interface useNameRequest {
  userType: number
}
interface useName {
  useriId: string
  username: string
}
interface useNameRes {
  data: useName[]
}

interface UserCreateRequestBody {
  userId: string
}
interface UserCreateList {
  data: {
    commissionType: string
    mobileAppCharge: number
    myCasinoCommission: number
    myCasinoPartnership: number
    myIntlCasinoPartnership: number
    myMatchCommission: number
    myPartnership: number
    mySessionCommision: number
  }
}

interface UserCreateResponseBody {
  data: UserCreateList
}

interface UserCreateBody {
  username: string
  reference: string
  password: string
  contact: string
  mobileAppCharge: string
  partnership: null | number
  casinoPartnership: null | number
  internationalCasinoPartnership: null | number
  commissionType: null | number
  matchCommission: null | number
  sessionCommission: null | number
  casinoCommission: null | number
}
interface UserCreateResBody {
  message(message: any): unknown
  status: any
  data: {
    userId: string
    password: string
  }
}

interface UserProfile {
  success: boolean
  data: {
    id: string
    username: string
    userId: string
    userType: string
    fullName: string
    contactNo: string
    isActive: boolean
    bettingStatus: boolean
    balance: number
    exposure: number
    availableBalance: number
    creditLimit: number
    actualBalance: number
    rateDifference?: number
  }
}
export interface ChangePaaReq {
  currentPassword: string
  newPassword: string
}

export interface UserLiabilityData {
  matchName: string
  stake: number
  odds: number
  marketType: string
  date: string
  profit: number
  loss: number
  selectionName: string
  back: boolean
}

export interface UserLiabilityResponse {
  status: boolean
  message: string | null
  data: UserLiabilityData[]
}

interface ChangePaaRes {
  status: boolean
  message: string
  data: null
}
interface UserDetailsUpdateReq {
  userId: string
}
export interface UserDetailsUpdateRes {
  status: boolean
  message: null
  data: {
    userId: string
    userName: string
    reference: string
    password: string
    contact: string
    flatShare: boolean
    casinoPlay: boolean
    mobileAppCharge: number
    adminPartnership: number
    adminCasinoPartnership: number
    adminIntlCasinoPartnership: number
    adminMatchCommission: number
    adminSessionCommision: number
    adminCasinoCommission: number
    myPartnership: number
    myCasinoPartnership: number
    myIntlCasinoPartnership: number
    myMatchCommission: number
    mySessionCommision: number
    myCasinoCommission: number
  }
}

interface ActiveUserReq {
  userId: string
  activate: boolean
}
interface ActiveUserRes {
  status: boolean
  message: string
  data: null
}

interface LedgerPaylod {
  userId: string
  amount: number
  collection: string
  paymentType: string
  remark: string
}
interface LedgerBody {
  status: boolean
  message: string
  data: null
}
interface LedgerDetailsReq {
  userId: string
}
interface LedgerDetail {
  date: string | null
  collectionName: string
  paymentType: string
  remark: string
  credit: number
  debit: number
  balance: number
}

interface LedgerDetailsRes {
  status: boolean
  message: string | null
  data: LedgerDetail[]
}
interface LogOutRes {
  status: boolean
  message: string
  data: null
}

// Bookmaker/Match Odds Bet Request
export interface BookmakerBetReq {
  betType: "bookmaker" | "matchOdds"
  matchId: string
  marketId: string
  beventId: string
  backOrLay: "back" | "lay"
  team: string
  teamASid: string
  teamBSid: string
  teamSid: string
  odds: number
  stake: number
  ipAddress: string
  deviceInfo: DeviceInfo | null
}

// Fancy Bet Request
export interface FancyBetReq {
  betType: "fancy"
  matchId: string
  marketId: string
  beventId: string
  backOrLay: "yes" | "no"
  fancyName: string
  fancyId: string
  runs: number
  odds: number
  stake: number
  size: number
  ipAddress: string
  deviceInfo: DeviceInfo | null
}

// Union type for all bet requests
export type BetplacedReq = BookmakerBetReq | FancyBetReq

export interface TossBetReq {
  beventId: string
  marketId: number
  sid: number
  selection: string
  stake: number
  matchName: string
}

export interface DeviceInfo {
  userAgent: string
  browser: string
  device: string
  deviceType: string
  os: string
  os_version: string
  browser_version: string
  orientation: string
}

export interface BetPlacedRes {
  message: string
  status?: boolean
  success?: boolean
}

export interface rateDeffReq {
  rateDifference: number
}
export interface rateDeffRes {
  status: boolean
  message: string
  data: null
}
export interface UserPassRequest {
  currentPassword: string
  newPassword: string
}
export interface UserPassResponse {
  status: boolean
  message: string
  data: null
}

export interface AccStatementReq {
  detailType: string
  fromDate: string
  toDate: string
  userId: string
}

export interface AccStatementRow {
  date?: string
  createdAt?: string
  createDate?: string
  description?: string
  remark?: string
  collectionName?: string
  prevBal?: number
  prevBalance?: number
  previousBalance?: number
  credit?: number
  cr?: number
  debit?: number
  dr?: number
  balance?: number
  bal?: number
}

export interface AccStatementRes {
  status?: boolean
  message?: string | null
  data?: AccStatementRow[]
}
export interface casinoResponse {
  status: boolean
  message: string
  data: Casino[]
}
export interface Casino {
  tableId: string | number | readonly string[] | undefined
  name: string
  image: string
  id: string
}

export interface UserBalance {
  success: boolean
  data: {
    id: string
    username: string
    userId: string
    userType: string
    fullName: string
    contactNo: string
    isActive: boolean
    bettingStatus: boolean
    balance: number
    exposure: number
    availableBalance: number
    creditLimit: number
    actualBalance: number
  }
}

export interface healthRes {
  status: boolean
  message: string
}

export interface BetListReq {
  matchId: string
}
export interface BetListRes {
  status: boolean
  message: null
  data: BetList
}

interface BetList {
  [key: string]: Bet[]
}

export interface Bet {
  declared: ReactNode
  sid: any
  nation: string
  rate: number
  amount: number
  priveValue: number
  marketName: string
  betTime: string
  pnl: number
  back: boolean
}

export interface OddsResponse {
  status: boolean
  message: null
  data: OdssPnl[]
}

interface SessionPlusMinusRes {
  status: boolean
  message: null
  data: {
    sessionPlusMinus: number
  }
}

export interface OdssPnl {
  marketId: string
  pnl1: number
  pnl2: number
  pnl3: number
  selection1: number
  selection2: number
  selection3: number
}

interface LedgerDataRes {
  success: boolean
  data: {
    ledger: DataLedger[]
    summary: {
      totalWon: number
      totalLost: number
      totalHisab: number
    }
    pagination: {
      total: number
      limit: number
      page: number
      totalPages: number
    }
  }
}
interface LedgerReq {
  matchId: number
}

interface DataLedger {
  sNo: number
  description: string
  matchName?: string
  wonBy?: string
  won: number
  lost: number
  rowPL: number
  type: string
  beventId: string
  fancyId: string | null
  settledAt: string
  hisab: number
  gameCode?: string
  gameDate?: string
  roundId?: string
  marketType?: string
}

interface LedgerListData {
  status: boolean
  message: null
  data: Data123
}

interface Data123 {
  matchName: ReactNode
  totalCommission: ReactNode
  date: string
  wonBy: null
  matchBet: number
  sessionBet: number
  matchWon: number
  sessionWon: number
  totalWon: number
  matchBets: MatchBet12[]
  sessionBets: SessionBet12[]
}

interface SessionBet12 {
  selectionName: string
  rate: number
  amount: number
  run: number
  mode: string
  date?: string
  declared?: number
}

interface MatchBet12 {
  selectionName: string
  rate: number
  amount: number
  mode: string
}

interface fancyBookreq {
  matchId: string
  fancyId: string
}

interface FancyBookRes {
  status: boolean
  message: null
  data: FancyData[]
}

interface FancyData {
  odds: number
  pnl: number
}

interface mybetRequest {
  tableId: number | string
  isGameCompleted: boolean
  sportId: number
}

interface CasinoBetPlacePaylod {
  casinoName: number
  colorName: string
  isBack: boolean
  marketId: string
  nation: string
  odds: number
  placeTime: string
  selectionId: string
  stake: number
  userIp: string
  diviceInfo: DeviceInfo
}


interface mybetResponce {
  status: boolean;
  message: null;
  data: mybet[];
}

interface mybet {
  back: boolean
  id: number;
  gameName: string;
  roundId: string;
  stake: number;
  odds: number;
  result: null;
  pnl: number;
  date: null;
  selectionName: string;
}


interface BetListLegdgerProps {
  date: string
}

interface BetListLegdgerRes {
  status: boolean;
  message: null;
  data: DataBetLedger;
}
interface DataBetLedger {
  totalCommission: ReactNode
  date: string;
  totalWon: number;
  dataAndBets: DataAndBet[];
}

interface DataAndBet {
  name: string;
  pnl: number;
  betList: BetListLedger[];
}

interface BetListLedger {
  selectionName: string;
  marketId: string;
  winner: string;
  rate: string;
  amount: number;
  mode: string;
}

interface channelReq { matchId: number }


interface ChanelRes {
  status: boolean;
  message: null;
  data: ChanelData;
}

interface ChanelData {
  matchId: number;
  channelId: string;
}


interface activeMatchRes {
  status: boolean;
  message: null;
  data: activeMatch[];
}

interface activeMatch {
  eventId: number;
  eventName: string;
  startDate: string;
  active: boolean;
}
