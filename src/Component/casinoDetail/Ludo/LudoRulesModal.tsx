import { useEffect, useState } from "react"
import "./LudoRulesModal.scss"

type Lang = "en" | "hi"
interface Section { icon: string; title: string; points: string[] }

// Rules as provided by the backend team. Keep both languages in sync.
const RULES: Record<Lang, Section[]> = {
  en: [
    { icon: "👥", title: "Players & Bots", points: [
      "A table seats 1 to 4 players.",
      "Seats still empty after a 15-second wait are filled by bots.",
      "If only 1 real player joins, they play against 3 bots.",
      "With 4 real players there are no bots — everyone plays each other.",
    ] },
    { icon: "🎨", title: "Colours & Seating", points: [
      "Colours are assigned in a fixed order: Red → Green → Yellow → Blue.",
      "With 2 players, they get opposite corners (Red + Yellow).",
      "With 3 or 4 players, seats are filled in order starting from Red.",
    ] },
    { icon: "🎲", title: "Turns & Dice", points: [
      "You get 8 seconds per turn to roll and move.",
      "The dice is cryptographically secure random (1–6).",
    ] },
    { icon: "➡️", title: "Moving Tokens", points: [
      "All tokens start in the yard, on your own star.",
      "Counting starts after the star — roll a 2 and your token moves 2 boxes ahead of the star.",
      "After the home column, reaching the centre finishes the token.",
    ] },
    { icon: "⚔️", title: "Cutting Tokens", points: [
      "Land on another colour's token to cut it — it goes back to its yard.",
      "Tokens on safe squares (the 8 star squares) can't be cut.",
      "Two tokens of the same colour on one square form a block and can't be cut either.",
    ] },
    { icon: "⭐", title: "Points", points: [
      "You score points equal to the dice value (roll 1 = 1 point).",
      "Cutting a token: +56 points.",
      "The player whose token is cut loses points equal to the distance that token had travelled.",
      "You also get bonus points when a token reaches home.",
    ] },
    { icon: "6️⃣", title: "The Six Rule", points: [
      "Rolling a 6 gives you an extra turn.",
      "Three 6s in a row cancel your turn, and the next player plays.",
      "Only sixes within your own turn count — if another player rolls in between, the count resets.",
    ] },
    { icon: "🔁", title: "Extra Turn After a Cut", points: [
      "Cutting an opponent's token gives you an extra turn.",
    ] },
    { icon: "⏰", title: "Missed Turns / Forfeit", points: [
      "If you don't roll or move within 8 seconds, that turn is missed.",
      "Missing 5 turns in total during a game means you forfeit and leave the game.",
    ] },
    { icon: "⌛", title: "Time Limit", points: [
      "Each game lasts at most 8 minutes.",
      "When time runs out, the highest score wins. A tie is a draw.",
    ] },
    { icon: "💰", title: "Entry Fee & Prize", points: [
      "Every real player pays the entry fee; the prize pool is the total of all fees.",
      "Platform cut is 10% — the winner gets 90% of the prize pool.",
      "In a draw, everyone gets a full refund of their entry fee.",
      "If a bot wins, nobody gets the prize, and the real players who lost lose their full entry fee.",
    ] },
    { icon: "🔒", title: "Account Control", points: [
      "Admin can lock or unlock Ludo for any user (or a whole downline). A locked user can't join a room.",
    ] },
  ],
  hi: [
    { icon: "👥", title: "खिलाड़ी और बॉट", points: [
      "एक टेबल पर 1 से 4 खिलाड़ी खेल सकते हैं।",
      "15 सेकंड इंतज़ार के बाद जो सीटें खाली रहती हैं, उन्हें बॉट भरते हैं।",
      "अगर सिर्फ 1 असली खिलाड़ी है, तो वह 3 बॉट के साथ खेलेगा।",
      "4 असली खिलाड़ी आ जाएँ तो कोई बॉट नहीं होगा, सब आपस में खेलेंगे।",
    ] },
    { icon: "🎨", title: "रंग और सीटें", points: [
      "4 रंग तय क्रम में मिलते हैं: लाल → हरा → पीला → नीला",
      "सिर्फ 2 खिलाड़ी हों तो आमने-सामने के कोने मिलते हैं (लाल + पीला)।",
      "3 या 4 खिलाड़ी हों तो क्रम से सीट मिलती है (लाल से शुरू)।",
    ] },
    { icon: "🎲", title: "बारी और डाइस", points: [
      "हर बारी में रोल और चाल के लिए 8 सेकंड मिलते हैं।",
      "डाइस पूरी तरह सुरक्षित रैंडम (1 से 6) है।",
    ] },
    { icon: "➡️", title: "गोटी चलाना", points: [
      "शुरुआत में सारी गोटियाँ यार्ड (घर) में, अपने स्टार पर होती हैं।",
      "गिनती स्टार के बाद से होती है — 2 आया तो गोटी स्टार से 2 खाने आगे जाएगी।",
      "होम कॉलम पार करके बीच (सेंटर) में पहुँचने पर गोटी फिनिश होती है।",
    ] },
    { icon: "⚔️", title: "गोटी काटना", points: [
      "किसी दूसरे रंग की गोटी पर अपनी गोटी पहुँचे तो वह कट जाती है और वापस यार्ड में जाती है।",
      "सेफ स्क्वेयर (8 स्टार वाले खाने) पर कोई गोटी नहीं कटती।",
      "एक ही रंग की 2 गोटियाँ एक खाने पर हों (ब्लॉक), तो वे भी नहीं कटतीं।",
    ] },
    { icon: "⭐", title: "पॉइंट्स", points: [
      "जितना डाइस आया, उतने पॉइंट मिलते हैं (1 आया तो 1 पॉइंट)।",
      "गोटी काटने पर +56 पॉइंट।",
      "जिसकी गोटी कटी, उसके उतने पॉइंट कम होंगे जितनी दूर उसकी गोटी जा चुकी थी।",
      "गोटी होम पहुँचने पर भी एक्स्ट्रा पॉइंट मिलते हैं।",
    ] },
    { icon: "6️⃣", title: "छक्के (6) का नियम", points: [
      "6 आने पर एक एक्स्ट्रा चांस मिलता है।",
      "लगातार 3 छक्के आएँ तो बारी रद्द हो जाती है और अगले खिलाड़ी को चांस मिलता है।",
      "लगातार छक्के सिर्फ आपकी अपनी बारी में गिने जाते हैं। बीच में किसी और की बारी आए तो गिनती फिर से शुरू होती है।",
    ] },
    { icon: "🔁", title: "काटने के बाद एक्स्ट्रा चांस", points: [
      "किसी दूसरे की गोटी काटने पर एक एक्स्ट्रा चांस मिलता है।",
    ] },
    { icon: "⏰", title: "बारी मिस / फॉरफ़िट", points: [
      "8 सेकंड में रोल या चाल नहीं की तो वह बारी मिस हो जाती है।",
      "पूरे गेम में कुल 5 बार बारी मिस करने पर खिलाड़ी गेम से बाहर (फॉरफ़िट) हो जाता है।",
    ] },
    { icon: "⌛", title: "समय सीमा", points: [
      "हर गेम ज़्यादा से ज़्यादा 8 मिनट का होता है।",
      "समय खत्म होने पर सबसे ज़्यादा स्कोर वाला जीतता है। स्कोर बराबर हो तो ड्रॉ होता है।",
    ] },
    { icon: "💰", title: "एंट्री फीस और इनाम", points: [
      "हर असली खिलाड़ी एंट्री फीस देता है, और सबकी फीस मिलाकर प्राइज़ पूल बनता है।",
      "प्लेटफ़ॉर्म कट 10% है — विजेता को प्राइज़ पूल का 90% मिलता है।",
      "ड्रॉ होने पर सबको पूरी एंट्री फीस वापस मिलती है।",
      "अगर बॉट जीत जाए, तो किसी को इनाम नहीं मिलता, और हारने वाले असली खिलाड़ी अपनी पूरी एंट्री फीस खो देते हैं।",
    ] },
    { icon: "🔒", title: "अकाउंट कंट्रोल", points: [
      "एडमिन किसी भी यूज़र (या पूरी डाउनलाइन) का लूडो लॉक या अनलॉक कर सकता है। लॉक होने पर वह रूम जॉइन नहीं कर पाएगा।",
    ] },
  ],
}

const LANG_KEY = "ludoRulesLang"
const readLang = (): Lang => {
  // Hindi by default; English only if the viewer picked it before.
  try { return localStorage.getItem(LANG_KEY) === "en" ? "en" : "hi" } catch { return "hi" }
}

const LudoRulesModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [lang, setLang] = useState<Lang>(readLang)

  const pickLang = (l: Lang) => {
    setLang(l)
    try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="lrm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="lrm-title">
      <div className="lrm-card" onClick={e => e.stopPropagation()}>
        <div className="lrm-head">
          <div id="lrm-title" className="lrm-title">📜 {lang === "hi" ? "लूडो के नियम" : "Ludo Rules"}</div>
          <div className="lrm-lang" role="tablist" aria-label="Language">
            <button role="tab" aria-selected={lang === "en"} className={lang === "en" ? "on" : ""} onClick={() => pickLang("en")}>English</button>
            <button role="tab" aria-selected={lang === "hi"} className={lang === "hi" ? "on" : ""} onClick={() => pickLang("hi")}>हिंदी</button>
          </div>
          <button className="lrm-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="lrm-body" lang={lang}>
          {RULES[lang].map((sec, i) => (
            <section key={sec.title} className="lrm-sec">
              <div className="lrm-sec-title">
                <span className="lrm-num">{i + 1}</span>
                <span className="lrm-icon" aria-hidden="true">{sec.icon}</span>
                {sec.title}
              </div>
              <ul>
                {sec.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            </section>
          ))}
        </div>

        <div className="lrm-foot">
          <button className="lrm-ok" onClick={onClose}>{lang === "hi" ? "समझ गया" : "Got it"}</button>
        </div>
      </div>
    </div>
  )
}

export default LudoRulesModal
