import { useEffect, useRef, useState } from 'react'
import { lowPower } from '../hooks.js'

// A floating five-leaf grimoire (cool mode only).
// Hover or focus: it opens and the pages riffle.
// Click: pixel particles flow out of it, then the message window opens.
// On touch screens: the first tap opens it, the second tap casts.

const QUOTES = [
  ['My magic is never giving up.', 'Asta, Black Clover'],
  ['Surpass your limits. Right here, right now.', 'Yami, Black Clover'],
  ["I have no strength, but I want it all. I have no knowledge, but all I do is dream. There's nothing I can do, but I struggle in vain!", 'Natsuki Subaru, Re: Zero'],
  ["You might be able to do it if you try. But if you don't try, you definitely can't.", 'Inori Yuzuriha, Guilty Crown'],
]

const PAGES = [0, 1, 2, 3, 4]

// Embers that drift up around the book. Fixed per visit.
const EMBERS = Array.from({ length: 18 }, () => ({
  x: Math.round(Math.random() * 300 - 150),
  dx: Math.round(Math.random() * 60 - 30),
  d: (2.6 + Math.random() * 2.8).toFixed(1),
  delay: (Math.random() * 4).toFixed(1),
}))

const LEAF = 'M0 0 C-14-10-16-27-6-29 C-2-30 0-27 0-24 C0-27 2-30 6-29 C16-27 14-10 0 0Z'

function Clover() {
  return (
    <svg className="gr-clover" viewBox="-34 -34 68 68" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={LEAF} transform={`rotate(${i * 72})`} />
      ))}
    </svg>
  )
}

// Square pixel particles that curl outward like a current, then fade.
function runBurst(canvas) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)

  const colors = ['#ffffff', '#ffb3bd', '#ff4d6d', '#ff2d55', '#ffd166']
  const count = lowPower ? 70 : 150
  const particles = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2
    const speed = 1.2 + Math.random() * 3.4
    return {
      x: w / 2 + Math.cos(a) * 24,
      y: h / 2 + Math.sin(a) * 16,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 1.2,
      life: 0,
      max: 60 + Math.random() * 50,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      curl: (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.045),
    }
  })

  let raf = 0
  let frame = 0
  const tick = () => {
    frame += 1
    ctx.clearRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'lighter'
    for (const p of particles) {
      const c = Math.cos(p.curl)
      const s = Math.sin(p.curl)
      const vx = p.vx * c - p.vy * s
      const vy = p.vx * s + p.vy * c
      p.vx = vx * 0.99
      p.vy = vy * 0.99 - 0.02
      p.x += p.vx
      p.y += p.vy
      p.life += 1
      const t = p.life / p.max
      if (t < 1) {
        ctx.globalAlpha = 1 - t
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
    }
    ctx.globalAlpha = 1
    if (frame < 105) raf = requestAnimationFrame(tick)
    else ctx.clearRect(0, 0, w, h)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export default function Grimoire({ onHire }) {
  const [open, setOpen] = useState(false)
  const [casting, setCasting] = useState(false)
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const [coarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )
  const canvasRef = useRef(null)
  const stopBurst = useRef(null)
  const castTimer = useRef(null)
  const pointerType = useRef('mouse')

  useEffect(
    () => () => {
      if (stopBurst.current) stopBurst.current()
      clearTimeout(castTimer.current)
    },
    []
  )

  const cast = () => {
    if (casting) return
    setOpen(true)
    setCasting(true)
    if (canvasRef.current) stopBurst.current = runBurst(canvasRef.current)
    castTimer.current = setTimeout(() => {
      setCasting(false)
      onHire()
    }, 1300)
  }

  const onClick = () => {
    if (pointerType.current === 'touch' && !open) {
      setOpen(true)
      return
    }
    cast()
  }

  return (
    <div className={`gr-sec${open ? ' is-open' : ''}${casting ? ' is-casting' : ''}`}>
      <blockquote className="gr-quote">
        <p>&ldquo;{quote[0]}&rdquo;</p>
        <footer>{quote[1]}</footer>
      </blockquote>

      <button
        type="button"
        className="grimoire"
        aria-label="Open the five-leaf grimoire to hire John James"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setOpen(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && !casting) setOpen(false)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => !casting && setOpen(false)}
        onClick={onClick}
      >
        <span className="gr-aura" aria-hidden="true" />
        <span className="gr-embers" aria-hidden="true">
          {EMBERS.map((e, i) => (
            <i key={i} style={{ '--x': `${e.x}px`, '--dx': `${e.dx}px`, '--d': `${e.d}s`, '--delay': `${e.delay}s` }} />
          ))}
        </span>

        <span className="gr-float" aria-hidden="true">
          <span className="gr-book">
            <span className="gr-base">
              <span className="gr-base-text">
                HIRE
                <br />
                ME
              </span>
            </span>
            {PAGES.map((i) => (
              <span key={i} className="gr-page" style={{ '--i': i }}>
                <span className="gr-face gr-front" />
                <span className="gr-face gr-back" />
              </span>
            ))}
            <span className="gr-cover">
              <span className="gr-face gr-front">
                <Clover />
              </span>
              <span className="gr-face gr-back">
                <span className="gr-circle" />
              </span>
            </span>
          </span>
        </span>

        <canvas ref={canvasRef} className="gr-canvas" aria-hidden="true" />
        {casting && (
          <span className="gr-cast" aria-hidden="true">
            HIRE ME!
          </span>
        )}
      </button>

      <p className="gr-hint">{coarse ? 'tap the grimoire to open it. tap again to cast.' : 'hover the book. then click it.'}</p>
    </div>
  )
}
