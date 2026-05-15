


interface CasinoResponse {
  success: boolean;
  data: Datum[];
}

interface Datum {
  mid: string;
  sid: string;
  win: string;
  cards: string;
  desc: string;
  gtype: string;
}
