import { useEffect, useRef, useState } from 'react'

// True on phones and weaker machines. Used to lower render cost.
export const lowPower =
  typeof window !== 'undefined' &&
  ((navigator.hardwareConcurrency || 8) <= 4 ||
    (navigator.deviceMemory || 8) <= 4 ||
    window.matchMedia('(pointer: coarse)').matches)

// Tells you when an element is on screen (plus a margin).
// With { once: true } it stays true after the first time.
export function useInView(rootMargin = '0px', { once = false } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) {
      setInView(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (once && entry.isIntersecting) io.disconnect()
      },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])

  return [ref, inView]
}

// Becomes true once the browser is idle, so the page text paints first.
export function useIdle(timeout = 300) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const go = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(go, timeout)
    return () => clearTimeout(id)
  }, [timeout])
  return ready
}
