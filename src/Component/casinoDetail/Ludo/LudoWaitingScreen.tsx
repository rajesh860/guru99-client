import { useState } from "react"
import "./LudoWaitingScreen.scss"

type Lang = "hi" | "en"

// Same key as the rules modal, so one language choice applies to both.
const LANG_KEY = "ludoRulesLang"
const readLang = (): Lang => {
  try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "hi" } catch { return "hi" }
}

const TEXT = {
  hi: {
    badge: "लूडो",
    title: "विरोधी खोजा जा रहा है…",
    sub: "दूसरे खिलाड़ियों के जुड़ने का इंतज़ार हो रहा है",
    bot: "कोई खिलाड़ी नहीं मिला तो बॉट जुड़ जाएगा",
    secs: "सेकंड",
    you: "आप",
    entry: "एंट्री",
    colour: "आपका रंग",
    tip: "टिप: 6 आने पर एक और चांस मिलता है!",
    cancel: "रद्द करें और पैसे वापस लें",
    back: "← वापस जाएँ",
    win: "जीत सकते हैं",
    retry: "फिर से कोशिश करें",
    colours: { red: "लाल", green: "हरा", yellow: "पीला", blue: "नीला" } as Record<string, string>,
  },
  en: {
    badge: "LUDO",
    title: "Finding Opponent…",
    sub: "Waiting for other players to join",
    bot: "A bot joins if no player is found",
    secs: "sec",
    you: "You",
    entry: "Entry",
    colour: "Your colour",
    tip: "Tip: rolling a 6 gives you another turn!",
    cancel: "Cancel & Refund",
    back: "← Back",
    win: "Win up to",
    retry: "Try Again",
    colours: { red: "Red", green: "Green", yellow: "Yellow", blue: "Blue" } as Record<string, string>,
  },
}

const RING_R = 30
const RING_C = 2 * Math.PI * RING_R

interface Props {
  botCountdown: number | null
  botTotal: number
  entryFee?: number
  /** Known once a room is joined; before that the colour chip is replaced by the prize. */
  myColor?: string
  /** "Win up to" amount, shown when there's no colour yet. */
  prize?: number
  /** "refund" once a room holds the fee; "back" while still matching. */
  cancelKind?: "refund" | "back"
  onCancel: () => void
  error?: string
  onRetry?: () => void
}

const LudoWaitingScreen = ({
  botCountdown, botTotal, entryFee, myColor, prize, cancelKind = "refund", onCancel, error, onRetry,
}: Props) => {
  const [lang, setLang] = useState<Lang>(readLang)
  const t = TEXT[lang]

  const pickLang = (l: Lang) => {
    setLang(l)
    try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ }
  }

  const color    = (myColor || "red").toLowerCase()
  const hasColor = !!myColor
  const progress = botCountdown != null && botTotal > 0 ? botCountdown / botTotal : 0
  const urgent   = botCountdown != null && botCountdown <= 5

  return (
    <div className="lws-screen">
      <div className="lws-card" lang={lang}>
        {/* Hero — same look as the "Ludo is LIVE" popup */}
        <div className="lws-hero">
          <span className="lws-badge">🎲 {t.badge}</span>
          <div className="lws-lang" role="tablist" aria-label="Language">
            <button role="tab" aria-selected={lang === "hi"} className={lang === "hi" ? "on" : ""} onClick={() => pickLang("hi")}>हिंदी</button>
            <button role="tab" aria-selected={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => pickLang("en")}>English</button>
          </div>

          {/* You vs searching slot, with a radar pulse */}
          <div className="lws-versus">
            <div className="lws-player">
              <div className={`lws-avatar lws-av-${color}`}>{hasColor ? color[0].toUpperCase() : "🙂"}</div>
              <span className="lws-player-name">{t.you}</span>
            </div>

            <div className="lws-vs">VS</div>

            <div className="lws-player">
              <div className="lws-avatar lws-av-search">
                <span className="lws-radar" />
                <span className="lws-radar lws-radar-2" />
                <span className="lws-q">?</span>
              </div>
              <span className="lws-player-name lws-dots"><i /><i /><i /></span>
            </div>
          </div>

          <span className="lws-confetti c1" />
          <span className="lws-confetti c2" />
          <span className="lws-confetti c3" />
        </div>

        <div className="lws-body">
          <div className="lws-title">{t.title}</div>
          <div className="lws-sub">{t.sub}</div>

          {error ? (
            <div className="lws-error">
              <span>{error}</span>
              {onRetry && <button className="lws-retry" onClick={onRetry}>{t.retry}</button>}
            </div>
          ) : botCountdown !== null ? (
            <div className={`lws-ring${urgent ? " urgent" : ""}`}>
              <svg viewBox="0 0 72 72" aria-hidden="true">
                <circle cx="36" cy="36" r={RING_R} className="lws-ring-track" />
                <circle
                  cx="36" cy="36" r={RING_R}
                  className="lws-ring-fill"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progress)}
                  transform="rotate(-90 36 36)"
                />
              </svg>
              <div className="lws-ring-text">
                <b>{botCountdown}</b>
                <span>{t.secs}</span>
              </div>
            </div>
          ) : (
            <div className="lws-spinner" aria-hidden="true" />
          )}

          {!error && hasColor && botCountdown !== null && botCountdown > 0 && (
            <div className="lws-bot-note">🤖 {t.bot}</div>
          )}

          <div className="lws-info">
            <div className="lws-info-item">
              <span className="lws-info-label">{t.entry}</span>
              <span className="lws-info-val">₹{(entryFee ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="lws-info-sep" />
            {hasColor ? (
              <div className="lws-info-item">
                <span className="lws-info-label">{t.colour}</span>
                <span className={`lws-chip lws-chip-${color}`}>{t.colours[color] ?? color}</span>
              </div>
            ) : (
              <div className="lws-info-item">
                <span className="lws-info-label">{t.win}</span>
                <span className="lws-info-val lws-win">₹{(prize ?? 0).toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          <div className="lws-tip">💡 {t.tip}</div>

          <button className={`lws-cancel${cancelKind === "back" ? " lws-cancel-back" : ""}`} onClick={onCancel}>
            {cancelKind === "back" ? t.back : t.cancel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LudoWaitingScreen
