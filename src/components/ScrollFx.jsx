import { useEffect, useRef } from 'react'
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
