import { useEffect, useRef } from 'react'
import GlassCard from './GlassCard.jsx'
import { Reveal } from './ScrollFx.jsx'

// Credits for the open source tools behind the site. Each card has its own hover animation.

const CREDITS = [
  {
    id: 'shader',
    kind: 'Used',
    name: 'ShaderGradient',
    by: 'shadergradient.co',
    role: 'The moving gradient behind everything.',
    href: 'https://shadergradient.co/',
  },
  {
    id: 'liquid',
    kind: 'Inspired by',
    name: 'liquid-logo',
    by: 'collidingScopes',
    role: 'My liquid-metal JJ monogram follows its idea.',
    href: 'https://github.com/collidingScopes/liquid-logo',
  },
  {
    id: 'glass',
    kind: 'Inspired by',
    name: 'liquid-glass-js',
    by: 'dashersw',
    role: 'The glass cards borrow its look.',
    href: 'https://github.com/dashersw/liquid-glass-js',
  },
  {
    id: 'r3f',
    kind: 'Used',
    name: 'React Three Fiber',
    by: 'pmndrs',
    role: 'The 3D ice cream cone.',
    href: 'https://r3f.docs.pmnd.rs/',
  },
  {
    id: 'lenis',
    kind: 'Used',
    name: 'Lenis',
    by: 'darkroom.engineering',
    role: 'The smooth scrolling.',
    href: 'https://github.com/darkroomengineering/lenis',
  },
]

// A dot that glides after your cursor, like Lenis smooths your scroll.
function LenisArt() {
  const wrap = useRef(null)
  const dot = useRef(null)
  const raf = useRef(0)
  const target = useRef({ x: 70, y: 40 })
  const pos = useRef({ x: 70, y: 40 })

  const loop = () => {
    pos.current.x += (target.current.x - pos.current.x) * 0.08
    pos.current.y += (target.current.y - pos.current.y) * 0.08
    if (dot.current) dot.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
    raf.current = requestAnimationFrame(loop)
  }
  const enter = () => {
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }
  const leave = () => {
    cancelAnimationFrame(raf.current)
    raf.current = 0
  }
  const move = (e) => {
    const r = wrap.current.getBoundingClientRect()
    target.current = { x: e.clientX - r.left - 9, y: e.clientY - r.top - 9 }
  }
  useEffect(() => leave, [])

  return (
    <div
      ref={wrap}
      className="art art-lenis"
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span ref={dot} className="lenis-dot" />
      <span className="lenis-hint">move your mouse</span>
    </div>
  )
}

function Art({ id }) {
  if (id === 'shader') return <div className="art art-shader" />
  if (id === 'liquid')
    return (
      <div className="art art-liquid">
        <span className="liquid-blob" />
      </div>
    )
  if (id === 'glass')
    return (
      <div className="art art-glass">
        <span className="glass-lens" />
      </div>
    )
  if (id === 'r3f')
    return (
      <div className="art art-r3f">
        <span className="cube">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    )
  return <LenisArt />
}

export default function Credits() {
  // The R3F card tilts toward your cursor.
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--rx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(2))
    e.currentTarget.style.setProperty('--ry', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(2))
  }
  const untilt = (e) => {
    e.currentTarget.style.setProperty('--rx', '0')
    e.currentTarget.style.setProperty('--ry', '0')
  }

  return (
    <div className="credits">
      {CREDITS.map((c, i) => (
        <Reveal key={c.id} delay={i * 70}>
          <GlassCard
            as="a"
            className={`credit credit-${c.id}`}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            onPointerMove={c.id === 'r3f' ? tilt : undefined}
            onPointerLeave={c.id === 'r3f' ? untilt : undefined}
          >
            <Art id={c.id} />
            <span className="credit-kind">{c.kind}</span>
            <span className="credit-name">{c.name}</span>
            <span className="credit-by">by {c.by}</span>
            <span className="credit-role">{c.role}</span>
          </GlassCard>
        </Reveal>
      ))}
    </div>
  )
}
