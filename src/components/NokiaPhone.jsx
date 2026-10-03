import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import SnakeGame from './SnakeGame.jsx'
import { sfx } from '../sound.js'

// A tiny Nokia-style phone. Click the keys, click the screen, or use your keyboard:
// arrow keys to move, Enter to select, Backspace to go back, digits to jump.
// In Snake, use the arrow keys or the 2 4 6 8 keys.

const PIXEL_ICE = [
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

function PixelIce() {
  return (
    <svg className="pixel-ice" viewBox="0 0 12 16" shapeRendering="crispEdges" aria-hidden="true">
      {PIXEL_ICE.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null
        )
      )}
    </svg>
  )
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000)
    return () => clearInterval(id)
  }, [])
  return now
}

const DIR_KEYS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  2: 'up',
  4: 'left',
  6: 'right',
  8: 'down',
}

const KEYS = [
  ['1', ''],
  ['2', 'abc'],
  ['3', 'def'],
  ['4', 'ghi'],
  ['5', 'jkl'],
  ['6', 'mno'],
  ['7', 'pqrs'],
  ['8', 'tuv'],
  ['9', 'wxyz'],
  ['*', ''],
  ['0', ''],
  ['#', ''],
]

export default function NokiaPhone({ projects, profile, about, mode, onMode, reduced }) {
  const phoneRef = useRef(null)
  const listRef = useRef(null)
  const bodyRef = useRef(null)
  const toastTimer = useRef(null)
  const gameRef = useRef(null)
  const [stack, setStack] = useState([{ id: 'home', sel: 0 }])
  const [toast, setToast] = useState('')
  const [scroll, setScroll] = useState({ up: false, down: false })
  const [ringing, setRinging] = useState(false)
  const [snakeInfo, setSnakeInfo] = useState({ status: 'ready', score: 0 })
  const [best, setBest] = useState(0)
  const now = useClock()

  const loud = mode === 'loud'
  const cur = stack[stack.length - 1]

  const handleSnake = useCallback((info) => {
    setSnakeInfo(info)
    setBest((b) => Math.max(b, info.score))
  }, [])

  const menuItems = [
    { label: 'Projects', go: 'projects' },
    { label: 'Snake', go: 'snake' },
    { label: 'Profiles', go: 'profiles' },
    { label: 'Contacts', go: 'contacts' },
    { label: 'About me', go: 'about' },
  ]
  const profileItems = [
    { label: 'Silent (quiet)', mode: 'quiet' },
    { label: 'Loud', mode: 'loud' },
  ]
  const contactItems = [
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { label: 'LinkedIn', value: 'in/john-james-dayap', href: profile.linkedin },
    { label: 'GitHub', value: 'github.com/Vaujx', href: profile.github },
  ]
  const project = cur.id === 'project' ? projects.find((p) => p.id === cur.projectId) : null

  const lists = {
    menu: menuItems,
    projects: projects.map((p) => ({ label: p.title })),
    profiles: profileItems,
    contacts: contactItems,
  }
  const items = lists[cur.id]

  const titles = {
    menu: 'Menu',
    projects: 'Projects',
    project: project ? project.title : '',
    profiles: 'Profiles',
    contacts: 'Contacts',
    about: 'About me',
    snake: 'Snake',
  }
  const snakeNavi = { ready: 'Start', playing: 'Pause', paused: 'Play', over: 'Retry' }
  const naviLabels = {
    home: 'Menu',
    menu: 'Select',
    projects: 'Select',
    project: 'Open',
    profiles: 'Select',
    contacts: 'Open',
    about: 'Back',
    snake: snakeNavi[snakeInfo.status],
  }
  const naviLabel = naviLabels[cur.id]

  const push = (id, extra = {}) => setStack((s) => [...s, { id, sel: 0, ...extra }])
  const pop = () => {
    if (stack.length > 1) sfx.back()
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }
  const setSel = (i) =>
    setStack((s) => [...s.slice(0, -1), { ...s[s.length - 1], sel: i }])

  const move = (d) => {
    sfx.key()
    if (cur.id === 'snake') {
      gameRef.current?.turn(d < 0 ? 'up' : 'down')
      return
    }
    if (items) {
      setStack((s) => {
        const top = s[s.length - 1]
        const n = items.length
        return [...s.slice(0, -1), { ...top, sel: (top.sel + d + n) % n }]
      })
    } else if (bodyRef.current) {
      bodyRef.current.scrollTop += d * 20
    }
  }

  const openHref = (href) => {
    if (href.startsWith('mailto:')) window.location.href = href
    else window.open(href, '_blank', 'noopener,noreferrer')
  }

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1400)
  }

  const activate = (i = cur.sel) => {
    sfx.select()
    switch (cur.id) {
      case 'home':
        push('menu')
        break
      case 'menu':
        push(menuItems[i].go, menuItems[i].go === 'profiles' ? { sel: loud ? 1 : 0 } : {})
        // Snake listens to the keyboard, so make sure the phone has focus.
        if (menuItems[i].go === 'snake') phoneRef.current?.focus({ preventScroll: true })
        break
      case 'snake':
        gameRef.current?.primary()
        break
      case 'projects':
        setSel(i)
        push('project', { projectId: projects[i].id })
        break
      case 'project':
        openHref(project.link)
        break
      case 'profiles':
        setSel(i)
        onMode(profileItems[i].mode)
        flash(profileItems[i].mode === 'loud' ? 'Loud profile on' : 'Silent profile on')
        break
      case 'contacts':
        setSel(i)
        openHref(contactItems[i].href)
        break
      case 'about':
        pop()
        break
      default:
        break
    }
  }

  const pressDigit = (n) => {
    if (cur.id === 'snake') {
      const dir = DIR_KEYS[n]
      if (dir) gameRef.current?.turn(dir)
      return
    }
    if (items && n >= 1 && n <= items.length) activate(n - 1)
  }

  const onKeyDown = (e) => {
    if (cur.id === 'snake' && DIR_KEYS[e.key]) {
      e.preventDefault()
      gameRef.current?.turn(DIR_KEYS[e.key])
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      move(1)
    } else if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault()
      pop()
    } else if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault()
      activate()
    } else if (/^[0-9]$/.test(e.key)) {
      pressDigit(Number(e.key))
    }
  }

  // Keep the selected row visible inside the small screen.
  useEffect(() => {
    const c = listRef.current
    if (!c) return
    const el = c.children[cur.sel]
    if (!el) return
    if (el.offsetTop < c.scrollTop) c.scrollTop = el.offsetTop
    else if (el.offsetTop + el.offsetHeight > c.scrollTop + c.clientHeight)
      c.scrollTop = el.offsetTop + el.offsetHeight - c.clientHeight
  }, [cur.sel, cur.id])

  // Show little scroll arrows when a text screen is longer than the display.
  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!el) {
      setScroll({ up: false, down: false })
      return undefined
    }
    const update = () =>
      setScroll({
        up: el.scrollTop > 1,
        down: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
      })
    update()
    el.addEventListener('scroll', update)
    return () => el.removeEventListener('scroll', update)
  }, [cur.id, cur.projectId, mode])

  // The phone rings once when it scrolls into view.
  useEffect(() => {
    if (reduced) return undefined
    const el = phoneRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRinging(true)
          setTimeout(() => setRinging(false), 1800)
          io.disconnect()
        }
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const titleNode =
    cur.id === 'snake' ? (
      <>
        <span>Snake</span>
        <span>
          {snakeInfo.score} hi {best}
        </span>
      </>
    ) : (
      titles[cur.id]
    )

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const date = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div
      ref={phoneRef}
      className={`phone${ringing ? ' ring' : ''}`}
      tabIndex={0}
      role="group"
      aria-label="Interactive phone. Arrow keys move, Enter selects, Backspace goes back."
      onKeyDown={onKeyDown}
    >
      <div className="phone-speaker" aria-hidden="true" />

      <div className="lcd-bezel">
        <div className="lcd" aria-live={cur.id === 'snake' ? 'off' : 'polite'} onClick={() => phoneRef.current?.focus({ preventScroll: true })}>
          <div className="lcd-status" aria-hidden="true">
            <span className="bars">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="batt" />
          </div>

          {cur.id === 'home' ? (
            <div className="lcd-home">
              <div className="lcd-operator">JJ</div>
              <PixelIce />
              <div className="lcd-time">{time}</div>
              <div className="lcd-date">{date}</div>
            </div>
          ) : (
            <>
              <div className="lcd-title">{titleNode}</div>
              <div className="lcd-main">
                {cur.id === 'snake' ? (
                  <SnakeGame ref={gameRef} onState={handleSnake} />
                ) : items ? (
                  <div className="lcd-list" ref={listRef}>
                    {items.map((it, i) => (
                      <button
                        type="button"
                        key={it.label}
                        className={`lcd-item${i === cur.sel ? ' is-sel' : ''}`}
                        onClick={() => activate(i)}
                      >
                        <span className="num">{i + 1}</span>
                        <span className="txt">
                          {it.label}
                          {cur.id === 'profiles' && it.mode === mode ? ' *' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="lcd-body" ref={bodyRef}>
                    {project ? (
                      <>
                        <p>Flavor: {project.flavor}</p>
                        <p>{loud ? project.loud : project.quiet}</p>
                        <p>Made with: {project.tags.join(', ')}.</p>
                        <p>Press Open to see it on GitHub.</p>
                      </>
                    ) : (
                      <>
                        <p>{loud ? about.loud : about.quiet}</p>
                        <p>{about.likes}</p>
                        <p>{profile.location}.</p>
                      </>
                    )}
                  </div>
                )}
                {scroll.up && <span className="arr up" aria-hidden="true" />}
                {scroll.down && <span className="arr down" aria-hidden="true" />}
              </div>
              {cur.id === 'contacts' && <div className="lcd-info">{items[cur.sel].value}</div>}
            </>
          )}

          <div className="lcd-softkey">{naviLabel}</div>
          {toast && <div className="lcd-toast">{toast}</div>}
        </div>
      </div>

      <div className="phone-controls">
        <button type="button" className="key key-c" aria-label="Clear. Go back." onClick={pop}>
          C
        </button>
        <button
          type="button"
          className="key key-navi"
          aria-label={`Navigation key: ${naviLabel}`}
          onClick={() => activate()}
        />
        <div className="arrows">
          <button type="button" className="key key-arrow" aria-label="Scroll up" onClick={() => move(-1)}>
            <span className="tri up" />
          </button>
          <button type="button" className="key key-arrow" aria-label="Scroll down" onClick={() => move(1)}>
            <span className="tri down" />
          </button>
        </div>
      </div>

      <div className="keypad">
        {KEYS.map(([n, letters]) => (
          <button
            type="button"
            className="key key-num"
            key={n}
            aria-label={`Key ${n}`}
            onClick={() => (/[0-9]/.test(n) ? pressDigit(Number(n)) : sfx.key())}
          >
            <b>{n}</b>
            <i>{letters}</i>
          </button>
        ))}
      </div>
    </div>
  )
}
