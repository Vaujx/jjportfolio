// Tiny synthesized sounds for the phone. No audio files. Off by default.

let ctx = null
let enabled = false

export function setSoundEnabled(value) {
  enabled = value
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq = 800, slideTo, dur = 0.05, type = 'square', vol = 0.03 }) {
  if (!enabled) return
  const c = audio()
  if (!c) return
  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur)
  gain.gain.setValueAtTime(vol, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(now)
  osc.stop(now + dur + 0.02)
}

export const sfx = {
  key: () => tone({ freq: 1200, dur: 0.035 }),
  select: () => tone({ freq: 880, slideTo: 1320, dur: 0.07, vol: 0.035 }),
  back: () => tone({ freq: 520, slideTo: 340, dur: 0.07 }),
  eat: () => tone({ freq: 660, slideTo: 990, dur: 0.09, vol: 0.035 }),
  over: () => tone({ freq: 300, slideTo: 80, dur: 0.35, type: 'sawtooth', vol: 0.04 }),
}
