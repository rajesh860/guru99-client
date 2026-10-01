import SkyCasinoStream from "../SkyCasinoStream"

// qnsports table id -> sky99 HLS game key (sky99.co/hls/<game>/index.m3u8).
// sky99 relay (nano-relay-bet99) inhi tables ko 24x7 scrape karta hai.
// Jo id yahan nahi hai (jaise 3034 = 32 Card B, 3053 = Andar Bahar 20),
// uske liye pehle jaisa qnsports iframe hi dikhta hai.
const QN_TO_SKY: Record<string, string> = {
  "3030": "teen20",
  "3031": "teen1",
  "3032": "lucky7eu",
  "3035": "dt20",
  "3043": "abj",
  "3055": "card32",
  "3056": "aaa",
  "3034": "card32eu", // 2026-09-26: 32 Card B — sky99 relay pe add kiya
}

interface CasinoVideoProps {
  qnId: string | number
  title?: string
}

export default function CasinoVideo({ qnId, title }: CasinoVideoProps) {
  const game = QN_TO_SKY[String(qnId)]
  if (game) return <SkyCasinoStream game={game} className="sky-casino-video" />
  return (
    <iframe
      src={`https://alpha-g.qnsports.live/route/rih2.php?id=${qnId}`}
      title={title}
      allowFullScreen
    />
  )
}
