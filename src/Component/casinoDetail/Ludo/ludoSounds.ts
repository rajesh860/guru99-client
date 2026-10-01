// Generated Ludo sound effects (Web Audio API, no audio files needed).
// Browsers keep audio locked until a user gesture; unlockLudoAudio() is called
// from the dice tap so later sounds (opponent rolls, token moves) can play.

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {})
    return ctx
  } catch {
    return null
  }
}

export function unlockLudoAudio() {
  getCtx()
}

// Short filtered noise burst: one die hitting the table / another die.
function click(ac: AudioContext, at: number, gain: number, freq: number) {
  const len = Math.floor(ac.sampleRate * 0.04)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)

  const src = ac.createBufferSource()
  src.buffer = buf
  const bp = ac.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = freq
  bp.Q.value = 1.2
  const g = ac.createGain()
  g.gain.value = gain

  src.connect(bp).connect(g).connect(ac.destination)
  src.start(at)
}

/** Dice shaking and rattling, ~0.6s. */
export function playDiceRoll() {
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + 0.01
  const hits = 9
  for (let i = 0; i < hits; i++) {
    // hits get sparser and quieter as the die settles
    const at = t0 + 0.6 * Math.pow(i / hits, 1.4)
    click(ac, at, 0.9 - i * 0.07, 1800 + Math.random() * 1600)
  }
}

// Soft wooden "tok" for one token hop.
function tok(ac: AudioContext, at: number, pitch: number) {
  const osc = ac.createOscillator()
  osc.type = "triangle"
  osc.frequency.setValueAtTime(pitch, at)
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, at + 0.08)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(0.45, at + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.1)
  osc.connect(g).connect(ac.destination)
  osc.start(at)
  osc.stop(at + 0.12)
}

/** One hop per square moved (capped at 6), then a slightly lower landing tok. */
export function playTokenMove(steps: number) {
  const ac = getCtx()
  if (!ac) return
  const n = Math.max(1, Math.min(6, Math.round(steps)))
  const t0 = ac.currentTime + 0.01
  for (let i = 0; i < n; i++) tok(ac, t0 + i * 0.11, i === n - 1 ? 520 : 760)
}

/** Descending buzz when a token gets cut. */
export function playTokenCut() {
  const ac = getCtx()
  if (!ac) return
  const at = ac.currentTime + 0.01
  const osc = ac.createOscillator()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(420, at)
  osc.frequency.exponentialRampToValueAtTime(110, at + 0.35)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(0.25, at + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4)
  osc.connect(g).connect(ac.destination)
  osc.start(at)
  osc.stop(at + 0.42)
}

/** A single token hop; `landing` plays the lower final tok. */
export function playTokenHop(landing = false) {
  const ac = getCtx()
  if (!ac) return
  tok(ac, ac.currentTime + 0.005, landing ? 520 : 760)
}

// ── Cut cinematic soundtrack ──────────────────────────────────────────────
// Timed to LudoCutScene (2.3s clock, slash lands at ~0.74s):
//   0.00 king-entry whoosh + war drum · 0.52 sword wind-up / swoosh
//   0.74 blade "shing" + sub-boom impact + shatter crackle · 1.00 stinger chord

function noiseBuffer(ac: AudioContext, secs: number) {
  const len = Math.max(1, Math.floor(ac.sampleRate * secs))
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

// Filtered-noise sweep: swooshes and whooshes.
function whoosh(ac: AudioContext, out: AudioNode, at: number, dur: number, f0: number, f1: number, peak: number) {
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, dur)
  const bp = ac.createBiquadFilter()
  bp.type = "bandpass"
  bp.Q.value = 2.5
  bp.frequency.setValueAtTime(f0, at)
  bp.frequency.exponentialRampToValueAtTime(f1, at + dur)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + dur * 0.7)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(bp).connect(g).connect(out)
  src.start(at)
  src.stop(at + dur + 0.02)
}

// Low pitched drop = drum / sub impact.
function thump(ac: AudioContext, out: AudioNode, at: number, f0: number, f1: number, dur: number, peak: number) {
  const o = ac.createOscillator()
  o.type = "sine"
  o.frequency.setValueAtTime(f0, at)
  o.frequency.exponentialRampToValueAtTime(f1, at + dur)
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(out)
  o.start(at)
  o.stop(at + dur + 0.02)
}

// Metallic ring: inharmonic partials decaying at different rates.
function shing(ac: AudioContext, out: AudioNode, at: number) {
  ;[[2350, 0.10, 1.1], [3420, 0.07, 0.8], [4980, 0.05, 0.6], [6310, 0.035, 0.45], [1570, 0.05, 0.9]].forEach(([f, gain, dur]) => {
    const o = ac.createOscillator()
    o.type = "sine"
    o.frequency.setValueAtTime(f * 1.02, at)
    o.frequency.exponentialRampToValueAtTime(f, at + 0.15)
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(gain, at + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    o.connect(g).connect(out)
    o.start(at)
    o.stop(at + dur + 0.02)
  })
  // bright noise "tsss" of the blade edge
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, 0.35)
  const hp = ac.createBiquadFilter()
  hp.type = "highpass"
  hp.frequency.value = 5000
  const g = ac.createGain()
  g.gain.setValueAtTime(0.18, at)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35)
  src.connect(hp).connect(g).connect(out)
  src.start(at)
}

// Tiny sparkling ticks = the token shattering / sparks.
function crackle(ac: AudioContext, out: AudioNode, at: number) {
  for (let i = 0; i < 14; i++) {
    const t = at + Math.random() * 0.32
    const o = ac.createOscillator()
    o.type = "triangle"
    o.frequency.value = 2500 + Math.random() * 4500
    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
    o.connect(g).connect(out)
    o.start(t)
    o.stop(t + 0.08)
  }
}

// Short brassy chord hit for the "CUT!" title.
function stinger(ac: AudioContext, out: AudioNode, at: number, notes: number[], glideDown: boolean) {
  const lp = ac.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.setValueAtTime(900, at)
  lp.frequency.exponentialRampToValueAtTime(3200, at + 0.06)
  lp.frequency.exponentialRampToValueAtTime(700, at + 0.7)
  lp.connect(out)
  notes.forEach(f => {
    ;[-6, 6].forEach(cents => {
      const o = ac.createOscillator()
      o.type = "sawtooth"
      o.frequency.setValueAtTime(f, at)
      o.detune.value = cents
      if (glideDown) o.frequency.exponentialRampToValueAtTime(f * 0.84, at + 0.7)
      const g = ac.createGain()
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(0.045, at + 0.02)
      g.gain.setValueAtTime(0.045, at + 0.25)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.75)
      o.connect(g).connect(lp)
      o.start(at)
      o.stop(at + 0.8)
    })
  })
}

/**
 * Full soundtrack for the cut cinematic. `mood`: "win" when I cut someone
 * (triumphant major hit), "lose" when my token is cut (falling minor), else neutral.
 */
export function playCutScene(mood: "win" | "lose" | "neutral" = "neutral") {
  const ac = getCtx()
  if (!ac) return
  const t0 = ac.currentTime + 0.02

  // Master bus with a gentle compressor so the stacked hits don't clip.
  const comp = ac.createDynamicsCompressor()
  comp.threshold.value = -14
  comp.ratio.value = 4
  const master = ac.createGain()
  master.gain.value = 0.9
  master.connect(comp).connect(ac.destination)

  // 0.00 — king enters: airy whoosh + two war-drum hits
  whoosh(ac, master, t0, 0.32, 300, 1800, 0.22)
  thump(ac, master, t0 + 0.05, 110, 45, 0.35, 0.55)
  thump(ac, master, t0 + 0.28, 120, 48, 0.3, 0.4)

  // 0.52 — wind-up, then the fast swoosh into the slash
  whoosh(ac, master, t0 + 0.46, 0.14, 600, 350, 0.08)
  whoosh(ac, master, t0 + 0.60, 0.15, 700, 6500, 0.45)

  // 0.74 — impact
  const hit = t0 + 0.74
  shing(ac, master, hit)
  thump(ac, master, hit, 90, 28, 0.6, 0.85)
  whoosh(ac, master, hit, 0.4, 2500, 300, 0.2)
  crackle(ac, master, hit + 0.02)

  // 1.00 — title stinger
  const st = t0 + 1.0
  if (mood === "lose") stinger(ac, master, st, [220, 261.6, 311.1], true)    // A minor-ish, sliding down
  else stinger(ac, master, st, [261.6, 329.6, 392, 523.3], false)            // C major, bright
  thump(ac, master, st, 70, 40, 0.4, 0.4)
}
