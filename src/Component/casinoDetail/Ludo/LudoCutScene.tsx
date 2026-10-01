import "./LudoCutScene.scss"

// Full-screen "king slashes the token" cinematic, played when a token is cut.
// Pure SVG/CSS, ~2.2s, pointer-events: none so play is never blocked.

export interface CutFx {
  id: number
  attacker: string      // colour of the cutting player
  victim: string        // colour of the cut token
  attackerName: string
  victimName: string
  mine: "attacker" | "victim" | null
}

const HEX: Record<string, { main: string; dark: string; light: string }> = {
  red:    { main: "#e53935", dark: "#8e1c1a", light: "#ff8a80" },
  green:  { main: "#43a047", dark: "#1b5e20", light: "#a5d6a7" },
  yellow: { main: "#fbc02d", dark: "#b27b00", light: "#fff59d" },
  blue:   { main: "#1e88e5", dark: "#0d3c8a", light: "#90caf9" },
}
const col = (c: string) => HEX[c] ?? HEX.red

const SPARKS = Array.from({ length: 14 }, (_, i) => i)

const Token = ({ c, id }: { c: string; id: string }) => {
  const k = col(c)
  return (
    <svg viewBox="0 0 60 60" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-g`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor={k.light} />
          <stop offset="55%" stopColor={k.main} />
          <stop offset="100%" stopColor={k.dark} />
        </radialGradient>
      </defs>
      <path d="M30 4 C44 4 50 22 50 34 C50 48 41 56 30 56 C19 56 10 48 10 34 C10 22 16 4 30 4Z"
        fill={`url(#${id}-g)`} stroke="#fff" strokeWidth="2.5" />
      <ellipse cx="23" cy="18" rx="6" ry="9" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

const LudoCutScene = ({ fx }: { fx: CutFx }) => {
  const a = col(fx.attacker)
  const title    = fx.mine === "victim" ? "कट गई!" : "CUT!"
  const subtitle = `${fx.attackerName} ने ${fx.victimName} की गोटी काटी`

  return (
    <div key={fx.id} className={`lcs-overlay${fx.mine === "victim" ? " lcs-victim" : ""}`} aria-live="polite">
      <div className="lcs-flash" />
      <div className="lcs-scan" />

      <div className="lcs-stage">
        {/* HUD rings + target lock around the token */}
        <div className="lcs-hud">
          <span className="lcs-ring r1" />
          <span className="lcs-ring r2" />
          <span className="lcs-ring r3" />
          <span className="lcs-lock tl" /><span className="lcs-lock tr" />
          <span className="lcs-lock bl" /><span className="lcs-lock br" />
        </div>

        {/* The victim token, whole then split in two */}
        <div className="lcs-token lcs-whole"><Token c={fx.victim} id={`w${fx.id}`} /></div>
        <div className="lcs-token lcs-half lcs-top"><Token c={fx.victim} id={`t${fx.id}`} /></div>
        <div className="lcs-token lcs-half lcs-bot"><Token c={fx.victim} id={`b${fx.id}`} /></div>

        <div className="lcs-sparks">
          {SPARKS.map(i => (
            <i key={i} style={{ "--a": `${(360 / SPARKS.length) * i + (i % 2) * 9}deg`, "--d": `${70 + (i % 3) * 28}px` } as React.CSSProperties} />
          ))}
        </div>

        {/* King, robed in the attacker's colour */}
        <svg className="lcs-king" viewBox="0 0 130 170" aria-hidden="true">
          <defs>
            <linearGradient id={`cape${fx.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={a.main} />
              <stop offset="100%" stopColor={a.dark} />
            </linearGradient>
            <linearGradient id={`gold${fx.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="50%" stopColor="#f5c542" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
          {/* cape */}
          <path d="M28 70 Q10 120 18 168 L112 168 Q118 120 100 70 Z" fill={`url(#cape${fx.id})`} />
          {/* robe */}
          <path d="M42 72 Q36 120 40 168 L90 168 Q94 120 88 72 Z" fill="#f5f0e6" />
          <rect x="60" y="72" width="10" height="96" fill={`url(#gold${fx.id})`} />
          <path d="M40 72 Q65 92 90 72 L88 82 Q65 100 42 82 Z" fill="#fff" opacity="0.9" />
          {/* left arm on hip */}
          <path d="M42 80 Q24 100 36 118" stroke={a.dark} strokeWidth="11" fill="none" strokeLinecap="round" />
          {/* head */}
          <circle cx="65" cy="50" r="18" fill="#f1c27d" />
          <path d="M48 54 Q65 82 82 54 Q74 64 65 64 Q56 64 48 54Z" fill="#e8e8e8" />
          <circle cx="58" cy="47" r="2.2" fill="#2b2b2b" />
          <circle cx="72" cy="47" r="2.2" fill="#2b2b2b" />
          <path d="M54 41 L62 43 M76 41 L68 43" stroke="#2b2b2b" strokeWidth="2.4" strokeLinecap="round" />
          {/* crown */}
          <path d="M45 34 L47 14 L56 26 L65 8 L74 26 L83 14 L85 34 Z" fill={`url(#gold${fx.id})`} stroke="#8a6508" strokeWidth="1.5" />
          <circle cx="65" cy="27" r="3.2" fill="#e53935" />
          <circle cx="53" cy="29" r="2.2" fill="#1e88e5" />
          <circle cx="77" cy="29" r="2.2" fill="#43a047" />
        </svg>

        {/* Sword arm pivots at the king's right shoulder */}
        <div className="lcs-sword">
          <span className="lcs-trail" />
          <svg viewBox="0 0 24 180" aria-hidden="true">
            <defs>
              <linearGradient id={`blade${fx.id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9fb3c8" />
                <stop offset="45%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#7d8fa3" />
              </linearGradient>
            </defs>
            <path d="M12 2 L18 20 L18 128 L6 128 L6 20 Z" fill={`url(#blade${fx.id})`} stroke="#dff6ff" strokeWidth="1" />
            <line x1="12" y1="18" x2="12" y2="126" stroke="rgba(0,200,255,0.55)" strokeWidth="1.5" />
            <rect x="0" y="128" width="24" height="7" rx="3" fill="#f5c542" stroke="#8a6508" />
            <rect x="8.5" y="135" width="7" height="26" rx="2" fill="#6d3b17" />
            <circle cx="12" cy="166" r="6" fill="#f5c542" stroke="#8a6508" />
          </svg>
        </div>

        {/* The slash itself */}
        <div className="lcs-slash" />
      </div>

      <div className="lcs-text">
        <div className="lcs-title" data-text={title}>{title}</div>
        <div className="lcs-sub">⚔️ {subtitle}</div>
      </div>
    </div>
  )
}

export default LudoCutScene
