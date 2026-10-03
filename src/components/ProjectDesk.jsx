import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useScrollVar } from './ScrollFx.jsx'

// Project folders you drag onto a retro TV.
// - Mouse: drag a folder onto the TV, or just click it.
// - Touch and keyboard: tap or press Enter and the folder flies to the TV.
// The project then opens inside the TV, and can be expanded to a bigger window.

const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function FolderArt({ project }) {
  return (
    <>
      <span className="folder-tab" aria-hidden="true" />
      <span className="folder-back" aria-hidden="true" />
      <span className="folder-paper" aria-hidden="true" />
      <span className="folder-front">
        <span className="folder-swatch" style={{ background: project.swatch }} aria-hidden="true" />
        <span className="folder-name">{project.title}</span>
        <span className="folder-kind">{project.kind}</span>
      </span>
    </>
  )
}

function ProjectWindow({ project, loud, view, setView, onClose, onExpand, expanded }) {
  const showLive = view === 'live' && project.live
  return (
    <div className={`pwin${expanded ? ' is-large' : ''}`}>
      <div className="pwin-bar">
        <span className="pwin-title">{`C:\\FLAVORS\\${project.title.toUpperCase()}`}</span>
        <span className="pwin-btns">
          {!expanded && (
            <button type="button" onClick={onExpand} aria-label="Expand to a bigger window">
              BIG
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label={expanded ? 'Close the bigger window' : 'Eject the folder'}
            autoFocus={expanded}
          >
            X
          </button>
        </span>
      </div>

      <div className={`pwin-body${showLive ? ' is-live' : ''}`} data-lenis-prevent>
        {showLive ? (
          <div className="pwin-live">
            <div className="pwin-addr">{project.live}</div>
            <iframe
              title={`${project.title} live demo`}
              src={project.live}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
            <p className="pwin-note">
              Blank screen? Some sites block embedding.{' '}
              <a href={project.live} target="_blank" rel="noreferrer">
                Open it in a new tab
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            {project.image && (
              <img className="pwin-img" src={project.image} alt={`${project.title} screenshot`} loading="lazy" />
            )}
            <p className="pwin-flavor">
              <span className="pwin-dot" style={{ background: project.swatch }} aria-hidden="true" />
              Flavor: {project.flavor}
            </p>
            <h3>{project.name}</h3>
            <p className="pwin-kind">{project.kind}</p>
            <p>{loud ? project.loud : project.quiet}</p>
            <ul className="pwin-tags">
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="pwin-actions">
        <a className="pbtn" href={project.link} target="_blank" rel="noreferrer">
          View code on GitHub
        </a>
        {project.live && (
          <button type="button" className="pbtn" onClick={() => setView(showLive ? 'about' : 'live')}>
            {showLive ? 'Back to details' : 'Try live demo'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProjectDesk({ projects, mode, reduced }) {
  const loud = mode === 'loud'
  const t = (quiet, loudText) => (loud ? loudText : quiet)

  const [openId, setOpenId] = useState(null)
  const [screen, setScreen] = useState('idle') // idle | loading | window
  const [view, setView] = useState('about') // about | live
  const [expanded, setExpanded] = useState(false)
  const [drag, setDrag] = useState(null)
  const [fly, setFly] = useState(null)
  const [coarse] = useState(isCoarsePointer)

  const deskRef = useRef(null)
  const tvRef = useRef(null)
  const scrollLink = useRef(null)
  const dragRef = useRef(null)
  const suppressClick = useRef(false)
  const loadTimer = useRef(null)
  const flyTimer = useRef(null)

  useEffect(
    () => () => {
      clearTimeout(loadTimer.current)
      clearTimeout(flyTimer.current)
    },
    []
  )

  // Escape closes the big window, and the page behind stops scrolling.
  useEffect(() => {
    if (!expanded) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.classList.add('modal-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('modal-open')
    }
  }, [expanded])

  // Folders slide in and the TV tunes in as the section scrolls into view.
  useScrollVar(deskRef, { start: 0.95, end: 0.5, name: '--tp' })

  const project = projects.find((p) => p.id === openId) || null

  const openProject = (id) => {
    if (id === openId && screen === 'window') return
    clearTimeout(loadTimer.current)
    setOpenId(id)
    setView('about')
    setExpanded(false)
    if (reduced) {
      setScreen('window')
      return
    }
    setScreen('loading')
    loadTimer.current = setTimeout(() => setScreen('window'), 1100)
  }

  const eject = () => {
    clearTimeout(loadTimer.current)
    setScreen('idle')
    setOpenId(null)
    setExpanded(false)
  }

  const isOverTv = (x, y) => {
    const el = tvRef.current
    if (!el) return false
    const r = el.getBoundingClientRect()
    const pad = 16
    return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
  }

  // Click, tap or Enter: the folder flies to the TV.
  const flyOpen = (p, el) => {
    if (p.id === openId && screen !== 'idle') return
    const tv = tvRef.current
    if (reduced || !tv) {
      openProject(p.id)
      return
    }
    const tr = tv.getBoundingClientRect()
    // On small screens the TV can be off screen. Scroll to it and open there.
    if (tr.top < 70 || tr.bottom > window.innerHeight - 20) {
      if (scrollLink.current) scrollLink.current.click()
      openProject(p.id)
      return
    }
    const fr = el.getBoundingClientRect()
    setFly({
      id: p.id,
      x: fr.left,
      y: fr.top,
      w: fr.width,
      h: fr.height,
      tx: tr.left + tr.width / 2 - fr.width / 2,
      ty: tr.top + tr.height / 2 - fr.height / 2,
      go: false,
    })
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setFly((f) => (f ? { ...f, go: true } : f)))
    )
    clearTimeout(flyTimer.current)
    flyTimer.current = setTimeout(() => {
      setFly(null)
      openProject(p.id)
    }, 560)
  }

  // Mouse and pen dragging. Touch is left alone so the page still scrolls.
  const handlers = (p) => ({
    onPointerDown: (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return
      const r = e.currentTarget.getBoundingClientRect()
      dragRef.current = {
        id: p.id,
        sx: e.clientX,
        sy: e.clientY,
        ox: e.clientX - r.left,
        oy: e.clientY - r.top,
        w: r.width,
        h: r.height,
        moved: false,
      }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e) => {
      const d = dragRef.current
      if (!d || d.id !== p.id) return
      if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true
      if (d.moved) {
        setDrag({
          id: d.id,
          x: e.clientX - d.ox,
          y: e.clientY - d.oy,
          w: d.w,
          h: d.h,
          over: isOverTv(e.clientX, e.clientY),
        })
      }
    },
    onPointerUp: (e) => {
      const d = dragRef.current
      dragRef.current = null
      if (!d) return
      if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      if (d.moved) {
        // A drag also ends with a click event. Ignore that one.
        suppressClick.current = true
        setTimeout(() => {
          suppressClick.current = false
        }, 60)
        const over = isOverTv(e.clientX, e.clientY)
        setDrag(null)
        if (over) openProject(d.id)
      }
    },
    onPointerCancel: () => {
      dragRef.current = null
      setDrag(null)
    },
    onClick: (e) => {
      if (suppressClick.current) return
      flyOpen(p, e.currentTarget)
    },
  })

  const dragProject = drag ? projects.find((p) => p.id === drag.id) : null
  const flyProject = fly ? projects.find((p) => p.id === fly.id) : null

  let idleMessage = t('DRAG A FOLDER HERE', 'FEED ME A FOLDER!')
  if (coarse) idleMessage = t('TAP A FOLDER', 'TAP A FOLDER!')
  if (drag && drag.over) idleMessage = t('DROP TO OPEN', 'DROP IT!!')

  const windowProps = {
    project,
    loud,
    view,
    setView,
    onClose: eject,
  }

  return (
    <div className="desk" ref={deskRef} style={{ '--tp': 0 }}>
      <div className="folders-col">
        <ul className="folders" aria-label="Project folders">
          {projects.map((p, index) => {
            const lifted = (drag && drag.id === p.id) || (fly && fly.id === p.id)
            const onTv = openId === p.id && screen !== 'idle'
            return (
              <li key={p.id} className="folder-cell" style={{ '--k': index }}>
                <button
                  type="button"
                  className={`folder${lifted ? ' is-lifted' : ''}${onTv ? ' is-on-tv' : ''}`}
                  aria-label={`${p.title}, ${p.kind}. Press to open it on the TV. You can also drag it there.`}
                  onDragStart={(e) => e.preventDefault()}
                  {...handlers(p)}
                >
                  <FolderArt project={p} />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="folders-hint">
          {coarse
            ? t('Tap a folder. It flies to the TV.', 'Tap a folder. Watch it fly!')
            : t('Drag a folder onto the TV. Or just click it.', 'Grab a folder. Throw it at the TV. Go on.')}
        </p>
      </div>

      <div className="tv-col">
        <a ref={scrollLink} href="#tv" className="sr-only" tabIndex={-1} aria-hidden="true">
          Go to the TV
        </a>
        <p className="tv-tuning" aria-hidden="true">
          ...tuning in
        </p>
        <div
          id="tv"
          ref={tvRef}
          className={`tv${screen !== 'idle' ? ' is-on' : ''}${drag && drag.over ? ' is-over' : ''}`}
        >
          <div className="tv-antenna" aria-hidden="true">
            <i />
            <i />
          </div>
          <div className="tv-body">
            <div className="tv-screen" aria-live="polite">
              <div className="tv-glass">
                {screen === 'idle' && (
                  <div className="tv-idle">
                    <span className="tv-ch">CH 03</span>
                    <div className="tv-arrow" aria-hidden="true" />
                    <div className="tv-msg">{idleMessage}</div>
                  </div>
                )}
                {screen === 'loading' && project && (
                  <div className="tv-loading">
                    <div className="tv-msg">LOADING</div>
                    <div className="tv-name">{project.title}</div>
                    <div className="tv-bar" aria-hidden="true">
                      <i />
                    </div>
                  </div>
                )}
                {screen === 'window' && project && !expanded && (
                  <ProjectWindow {...windowProps} onExpand={() => setExpanded(true)} expanded={false} />
                )}
                {screen === 'window' && project && expanded && (
                  <div className="tv-idle">
                    <div className="tv-msg">BIG WINDOW OPEN</div>
                  </div>
                )}
              </div>
              <div className="tv-scan" aria-hidden="true" />
            </div>
            <div className="tv-side" aria-hidden="true">
              <span className="tv-led" />
              <span className="knob" style={{ '--r': '25deg' }} />
              <span className="knob" style={{ '--r': '-40deg' }} />
              <span className="grille" />
            </div>
          </div>
          <div className="tv-feet" aria-hidden="true" />
        </div>

        <p className="desk-links">
          Straight to the code:{' '}
          {projects.map((p, i) => (
            <span key={p.id}>
              <a href={p.link} target="_blank" rel="noreferrer">
                {p.title}
              </a>
              {i < projects.length - 1 ? ', ' : ''}
            </span>
          ))}
          .
        </p>
      </div>

      {/* The folder you are dragging, and the one flying to the TV */}
      {dragProject &&
        createPortal(
          <div
            className="folder-ghost is-drag"
            style={{ width: drag.w, height: drag.h, transform: `translate(${drag.x}px, ${drag.y}px) rotate(-4deg) scale(1.06)` }}
            aria-hidden="true"
          >
            <div className="folder">
              <FolderArt project={dragProject} />
            </div>
          </div>,
          document.body
        )}
      {flyProject &&
        createPortal(
          <div
            className="folder-ghost"
            style={{
              width: fly.w,
              height: fly.h,
              transform: fly.go
                ? `translate(${fly.tx}px, ${fly.ty}px) scale(0.3) rotate(10deg)`
                : `translate(${fly.x}px, ${fly.y}px)`,
              opacity: fly.go ? 0.2 : 1,
              transition: fly.go ? 'transform 0.55s cubic-bezier(0.5, 0, 0.8, 0.4), opacity 0.55s ease-in' : 'none',
            }}
            aria-hidden="true"
          >
            <div className="folder">
              <FolderArt project={flyProject} />
            </div>
          </div>,
          document.body
        )}

      {/* The bigger window */}
      {expanded &&
        project &&
        createPortal(
          <div className="viewer-backdrop" data-lenis-prevent onClick={() => setExpanded(false)}>
            <div
              className="viewer"
              role="dialog"
              aria-modal="true"
              aria-label={`${project.title} project window`}
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectWindow {...windowProps} onClose={() => setExpanded(false)} expanded />
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
