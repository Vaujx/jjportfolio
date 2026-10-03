import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// A pixel-style message window.
// With a form endpoint (for example Formspree) it sends the message from the page.
// Without one it opens the visitor's email app with the message filled in.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMPTY = { name: '', from: '', message: '', website: '' }

const ENVELOPE = [0, 1, 2, 3, 4, 5]

function PixelEnvelope({ size = 28 }) {
  return (
    <svg
      width={size}
      height={(size * 12) / 16}
      viewBox="0 0 16 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="0" y="1" width="16" height="10" fill="#1c100a" />
      <rect x="1" y="2" width="14" height="8" fill="#fff3d6" />
      {ENVELOPE.map((i) => (
        <g key={i}>
          <rect x={1 + i} y={2 + i} width="1" height="1" fill="#1c100a" />
          <rect x={14 - i} y={2 + i} width="1" height="1" fill="#1c100a" />
        </g>
      ))}
    </svg>
  )
}

export default function ContactModal({ open, onClose, email, endpoint }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | opened | error
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    setStatus('idle')
    setErrors({})
    const previous = document.activeElement
    document.documentElement.classList.add('modal-open')
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('modal-open')
      if (previous && previous.focus) previous.focus()
    }
  }, [open])

  if (!open) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return // a bot filled the hidden field
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please add your name.'
    if (!EMAIL_RE.test(form.from.trim())) errs.from = 'That email looks off.'
    if (form.message.trim().length < 10) errs.message = 'Say a little more (10+ characters).'
    setErrors(errs)
    if (Object.keys(errs).length) return

    if (endpoint) {
      setStatus('sending')
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.from.trim(),
            message: form.message.trim(),
          }),
        })
        if (!res.ok) throw new Error('Send failed')
        setForm(EMPTY)
        setStatus('sent')
      } catch {
        setStatus('error')
      }
      return
    }

    const subject = `Portfolio message from ${form.name.trim()}`
    const body = `${form.message.trim()}\n\n${form.name.trim()}\n${form.from.trim()}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStatus('opened')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      /* clipboard can be blocked, the address is on screen anyway */
    }
  }

  return createPortal(
    <div className="mail-backdrop" data-lenis-prevent onClick={onClose}>
      <div className="mail-shell" onClick={(e) => e.stopPropagation()}>
        <div className="mail" role="dialog" aria-modal="true" aria-labelledby="mail-title">
          <div className="mail-inner">
            <div className="mail-bar">
              <span id="mail-title" className="mail-title">
                <PixelEnvelope size={22} /> NEW MESSAGE
              </span>
              <button type="button" className="mail-x" onClick={onClose} aria-label="Close the message window">
                X
              </button>
            </div>

            {status === 'sent' && (
              <div className="mail-done" role="status">
                <div className="mail-fly" aria-hidden="true">
                  <PixelEnvelope size={64} />
                </div>
                <p className="mail-big">MESSAGE SENT!</p>
                <p>Thank you. I'll reply as soon as I can.</p>
                <button type="button" className="mail-btn" onClick={onClose} autoFocus>
                  CLOSE
                </button>
              </div>
            )}

            {status === 'opened' && (
              <div className="mail-done" role="status">
                <div className="mail-fly" aria-hidden="true">
                  <PixelEnvelope size={64} />
                </div>
                <p className="mail-big">CHECK YOUR EMAIL APP</p>
                <p>Your message is ready to send there. Nothing opened? Copy my address:</p>
                <p className="mail-addr">{email}</p>
                <div className="mail-row">
                  <button type="button" className="mail-btn" onClick={copy}>
                    COPY ADDRESS
                  </button>
                  <button type="button" className="mail-btn mail-btn-alt" onClick={onClose}>
                    CLOSE
                  </button>
                </div>
              </div>
            )}

            {(status === 'idle' || status === 'sending' || status === 'error') && (
              <form className="mail-form" onSubmit={submit} noValidate>
                <p className="mail-to">
                  TO: <b>{email}</b>
                </p>

                <label className="mail-label" htmlFor="mail-name">
                  YOUR NAME
                </label>
                <input
                  id="mail-name"
                  className="mail-input"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                  autoFocus
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="mail-err" role="alert">{errors.name}</p>}

                <label className="mail-label" htmlFor="mail-from">
                  YOUR EMAIL
                </label>
                <input
                  id="mail-from"
                  type="email"
                  className="mail-input"
                  value={form.from}
                  onChange={set('from')}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.from)}
                />
                {errors.from && <p className="mail-err" role="alert">{errors.from}</p>}

                <label className="mail-label" htmlFor="mail-msg">
                  MESSAGE
                </label>
                <textarea
                  id="mail-msg"
                  className="mail-input mail-text"
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <p className="mail-err" role="alert">{errors.message}</p>}

                {/* Hidden field. Real people never fill it in. */}
                <input
                  className="sr-only"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  name="website"
                  value={form.website}
                  onChange={set('website')}
                />

                {status === 'error' && (
                  <p className="mail-err" role="alert">
                    Could not send it. Please email me directly at {email}.
                  </p>
                )}

                <div className="mail-row">
                  <button type="submit" className="mail-btn" disabled={status === 'sending'}>
                    {status === 'sending' ? 'SENDING...' : 'SEND'}
                  </button>
                  <button type="button" className="mail-btn mail-btn-alt" onClick={onClose}>
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
