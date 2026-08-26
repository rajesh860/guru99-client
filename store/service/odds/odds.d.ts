export interface matchedData {
    success: boolean
    count: number
    data: {
      live: MatchItem[]
      upcoming: MatchItem[]
    }
  }
    
  export interface MatchItem {
    gmid: number
    eventName: string
    sportName: string
    matchTime: string
    isLive: boolean
    beventId: string
    bid: string
    bmarketId: string
    status: string
    hasTV: boolean
    odds: MatchOdds
  }

  export interface MatchOdds {
    hasMatchOdds: boolean
    hasBookmaker: boolean
    hasFancy: boolean
    team1: TeamOdds
    team2: TeamOdds
    draw: TeamOdds | null
  }

  export interface TeamOdds {
    selectionId: number
    name: string
    status: string
    back: number
    backSize: number
    lay: number
    laySize: number
  }

  export interface matList {
    matchName: string
    matchId: number
    marketId: string
    openDate: string
    maxBet: number
    minBet: number
    maxBetRate: number
    minBetRate: number
    inPlay: boolean
    team1Back: number
    team1Lay: number
    team2Back: number
    team2Lay: number
    drawBack: number
    drawLay: number
    bm: boolean
    F: boolean
    GM: boolean
    SM: boolean
    channelId: any
  }


  export interface oddsResponse {
    type?: string
    beventId?: string
    ename?: string
    Odds?: Odd[]
    Bookmaker?: Bookmaker[]
    bookmaker?: BookmakerMarket[]
    Fancy?: any[]
    Fancy2?: Fancy2[]
    fancy?: FancyMarket[]
    Fancy3?: any[]
    Khado?: any[]
    Ball?: any[]
    Meter?: any[]
    OddEven?: any[]
    BallByBall?: any[]
    toss?: any[]
  }

  export interface BookmakerMarket {
    gmid: number
    mid: string
    pmid: string | null
    mname: string
    rem: string
    gtype: string
    status: string
    rc: number
    visible: boolean
    pid: number
    gscode: number
    maxb: number
    sno: number
    dtype: number
    ocnt: number
    m: number
    max: number
    min: number
    biplay: boolean
    umaxbof: number
    boplay: boolean
    iplay: boolean
    btcnt: number
    company: string | null
    section: BookmakerSection[]
    originalMid: number
    betLock: boolean
    isActive: boolean
    minBet: number
    maxBet: number
  }

  export interface BookmakerSection {
    sid: number
    psid: number
    sno: number
    psrno: number
    gstatus: string
    nat: string
    gscode: number
    max: number
    min: number
    rem: string
    br: boolean
    ik: number
    ikm: number
    odds: OddsItem[]
  }

  export interface OddsItem {
    psid: number
    odds: number
    otype: string
    oname: string
    tno: number
    size: number
  }

  export interface FancyMarket {
    gmid: number
    mid: number
    pmid: string | null
    mname: string
    rem: string
    gtype: string
    status: string
    rc: number
    visible: boolean
    pid: number
    gscode: number
    maxb: number
    sno: number
    dtype: number
    ocnt: number
    m: number
    max: number
    min: number
    biplay: boolean
    umaxbof: number
    boplay: boolean
    iplay: boolean
    btcnt: number
    company: string | null
    section: FancySection[]
  }

  export interface FancySection {
    sid: number
    psid: number
    sno: number
    psrno: number
    gstatus: string
    nat: string
    gscode: number
    max: number
    min: number
    rem: string
    br: boolean
    ik: number
    ikm: number
    odds: OddsItem[]
    fancyId: string
    betLock: boolean
    status: string
    result?: any
  }
  
  export interface Odd {
    runners: Runner[]
    matchName: string
    marketId: string
    isMarketDataDelayed: boolean
    status: string
    inplay: boolean
    Name: string
    eventTime: string
    lastMatchTime: string
    maxBetRate: number
    minBetRate: number
    betDelay: number
    maxBet: number
    minBet: number
    betlock: boolean
    display_message: string
  }
  
  export interface Runner {
    name: string
    selectionId: string
    runnerStatus: string
    ex: Ex
  }
  
  export interface Ex {
    availableToBack: AvailableToBack[]
    availableToLay: AvailableToLay[]
  }
  
  export interface AvailableToBack {
    price: number
    size: number
  }
  
  export interface AvailableToLay {
    price: number
    size: number
  }
  
  export interface Bookmaker {
    mid: string
    t: string
    sid: string
    nation: string
    b1: number
    bs1: number
    l1: number
    ls1: number
    gstatus: string
    matchName: string
    maxBetRate: number
    minBetRate: number
    betDelay: number
    maxBet: number
    minBet: number
    betlock: boolean
    display_message: string
  }
  
  export interface Fancy2 {
    mid: string
    t: string
    sid: string
    nation: string
    b1: number
    bs1: number
    l1: number
    ls1: number
    gstatus: string
    maxBet: number
    minBet: number
    betDelay: number
    isCommissionAllowed: boolean
    srno: string
  }
  export interface IpRes {
    ip: string
   
  }


  export interface stackRes {
    status: boolean
    message: any
    data: stackData
  }
  
  export interface stackData {
    stack1: number
    stack2: number
    stack3: number
    stack4: number
    stack5: number
    stack6: number
    stack7: number
    stack8: number
    stack9: number
    stack10: number
  }
  
  

  interface InplayRes {
  status: boolean;
  message: string;
  data: InplayData[];
}

interface InplayData {
  sportid: number;
  name: string;
  matchList: MatchList[];
}

interface MatchList {
  matchName: string;
  matchId: number;
  marketId?: string;
  openDate: string;
  maxBet?: number;
  minBet?: number;
  maxBetRate?: number;
  minBetRate?: number;
  league?: string;
  inPlay: boolean;
  team1Back?: number;
  team1Lay?: number;
  team2Back?: number;
  team2Lay?: number;
  drawBack?: number;
  drawLay?: number;
  bm?: boolean;
  F?: boolean;
  GM?: boolean;
  SM?: boolean;
  channelId?: number;
}