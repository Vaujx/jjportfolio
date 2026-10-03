import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks.js'

// One shared scroll listener for every scroll-linked effect on the page.
const subs = new Set()
let listening = false
let ticking = false

function run() {
  ticking = false
  subs.forEach((fn) => fn())
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(run)
  }
}

function subscribe(fn) {
  subs.add(fn)
  if (!listening) {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    listening = true
  }
  fn()
  return () => {
    subs.delete(fn)
    if (!subs.size && listening) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      listening = false
    }
  }
}

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Sets a CSS variable from 0 to 1 as the element scrolls up the screen.
// 0 when its top is at `start` of the viewport height, 1 when it reaches `end`.
export function useScrollVar(ref, { start = 0.9, end = 0.35, name = '--p' } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (prefersReduced()) {
      el.style.setProperty(name, '1')
      return undefined
    }
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = (vh * start - r.top) / (vh * (start - end))
      el.style.setProperty(name, Math.min(1, Math.max(0, p)).toFixed(3))
    }
    return subscribe(update)
  }, [ref, start, end, name])
}

// Words light up one by one as you scroll past the paragraph.
export function RevealText({ text, className = '' }) {
  const ref = useRef(null)
  useScrollVar(ref, { start: 0.88, end: 0.42 })
  const words = text.split(' ')
  return (
    <p ref={ref} className={`reveal-text ${className}`} style={{ '--p': 0, '--n': words.length }}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="rw" style={{ '--i': i }}>
          {w}{' '}
        </span>
      ))}
    </p>
  )
}

// Fades and lifts its children in the first time they scroll into view.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, inView] = useInView('0px 0px -10% 0px', { once: true })
  return (
    <Tag
      ref={ref}
      className={`reveal${inView ? ' in' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}

// A highlighter pen that swipes across a phrase when it scrolls into view.
export function Hl({ children }) {
  const [ref, inView] = useInView('0px 0px -20% 0px', { once: true })
  return (
    <mark ref={ref} className={`hl${inView ? ' in' : ''}`}>
      {children}
    </mark>
  )
}

// Which section is under the top third of the screen. null while you are still on the intro.
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.35
      let current = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    return subscribe(update)
  }, [ids])
  return active
}

// A thin line at the top of the page that fills as you scroll.
export function ScrollProgress() {
  const ref = useRef(null)
  useEffect(
    () =>
      subscribe(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? window.scrollY / max : 0
        if (ref.current) ref.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p)).toFixed(4)})`
      }),
    []
  )
  return <div ref={ref} className="progress" aria-hidden="true" />
}

const CONE = [
  '...######...',
  '..########..',
  '.##########.',
  '.##########.',
  '..########..',
  '.##########.',
  '############',
  '############',
  '.##########.',
  '..########..',
  '.##########.',
  '..#.#.#.#.#.',
  '...#.#.#.#..',
  '....#.#.#...',
  '.....#.#....',
  '......#.....',
]

// A round button that appears once you are past the halfway point.
export function BackToTop({ loud }) {
  const [show, setShow] = useState(false)
  useEffect(
    () =>
      subscribe(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setShow(max > 0 && window.scrollY / max > 0.5)
      }),
    []
  )
  return (
    <a
      href="#top"
      className={`to-top${show ? ' show' : ''}`}
      aria-label="Back to top"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      {loud ? (
        <svg viewBox="0 0 12 16" shapeRendering="crispEdges" aria-hidden="true">
          {CONE.flatMap((row, y) =>
            [...row].map((c, x) =>
              c === '#' ? (
                <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={y < 11 ? '#ff7aa8' : '#e0a458'} />
              ) : null
            )
          )}
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      )}
    </a>
  )
}
