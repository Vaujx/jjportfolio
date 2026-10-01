import { lazy, Suspense, useEffect, useState } from 'react'
import LiquidLogo from './components/LiquidLogo.jsx'
import GlassCard, { GlassFilter } from './components/GlassCard.jsx'
import NokiaPhone from './components/NokiaPhone.jsx'
import { PixelCursors, Splash } from './components/PhoneFlair.jsx'
import { profile, projects, experience, skills, phoneAbout } from './data.js'
import { useIdle, useInView } from './hooks.js'

// The heavy 3D and shader code loads in separate files, only when needed.
const Background = lazy(() => import('./components/Background.jsx'))
const IceCream = lazy(() => import('./components/IceCream.jsx'))

// Renders its children only once the spot is near the screen.
function LazyMount({ children, minHeight = 600, rootMargin = '300px' }) {
  const [ref, inView] = useInView(rootMargin, { once: true })
  return (
    <div ref={ref} style={{ minHeight }}>
      {inView ? children : null}
    </div>
  )
}

// The 3D cone: loads after the page is idle and pauses when scrolled away.
function HeroCone({ mode }) {
  const [ref, inView] = useInView('200px')
  const [seen, setSeen] = useState(false)
  const idle = useIdle()
  useEffect(() => {
    if (inView) setSeen(true)
  }, [inView])
  return (
    <div className="hero-3d" ref={ref}>
      {seen && idle && (
        <Suspense fallback={<div className="cone-skeleton" aria-hidden="true" />}>
          <IceCream mode={mode} active={inView} />
        </Suspense>
      )}
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener('change', update)
    return () => q.removeEventListener('change', update)
  }, [])
  return reduced
}

function useMode() {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('jj-mode') === 'loud' ? 'loud' : 'quiet'
    } catch {
      return 'quiet'
    }
  })
  useEffect(() => {
    document.documentElement.dataset.mode = mode
    try {
      localStorage.setItem('jj-mode', mode)
    } catch {
      /* storage can be blocked, that's fine */
    }
  }, [mode])
  return [mode, setMode]
}

export default function App() {
  const [mode, setMode] = useMode()
  const reduced = useReducedMotion()
  const loud = mode === 'loud'
  const t = (quiet, loudText) => (loud ? loudText : quiet)
  const idle = useIdle()

  // Real refraction only works with SVG backdrop filters on Chromium.
  useEffect(() => {
    const brands = navigator.userAgentData?.brands ?? []
    if (brands.some((b) => /Chromium/i.test(b.brand))) {
      document.documentElement.classList.add('refract')
    }
  }, [])

  // Smooth scrolling with Lenis. Loaded on demand, skipped for reduced motion.
  useEffect(() => {
    if (reduced) return undefined
    let lenis
    let raf = 0
    let cancelled = false

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
      const loop = (time) => {
        lenis.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })

    const onClick = (e) => {
      const a = e.target.closest ? e.target.closest('a[href^="#"]') : null
      if (!a || !lenis) return
      const id = a.getAttribute('href')
      if (id === '#top') {
        e.preventDefault()
        lenis.scrollTo(0)
        return
      }
      const el = id.length > 1 ? document.querySelector(id) : null
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el, { offset: -90 })
      }
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      if (lenis) lenis.destroy()
    }
  }, [reduced])

  return (
    <>
      <GlassFilter />
      <div className="bg" aria-hidden="true">
        {idle && (
          <Suspense fallback={null}>
            <Background mode={mode} reduced={reduced} />
          </Suspense>
        )}
      </div>

      <div className="page">
        <header className="nav-wrap">
          <GlassCard as="nav" className="nav" aria-label="Main">
            <a href="#top" className="nav-brand">
              JJ
            </a>
            <div className="nav-links">
              <a href="#about">About</a>
              <a href="#work">Work</a>
              <a href="#journey">Journey</a>
              <a href="#contact">Contact</a>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={loud}
              aria-label="Switch between quiet and loud mode"
              className="switch"
              onClick={() => setMode(loud ? 'quiet' : 'loud')}
            >
              <span className="switch-label">Quiet</span>
              <span className="switch-track">
                <span className="switch-knob" />
              </span>
              <span className="switch-label">Loud</span>
            </button>
          </GlassCard>
        </header>

        <main id="top">
          {/* ---------- Hero ---------- */}
          <section className="hero">
            <div className="hero-text">
              <LiquidLogo text="JJ" size={220} mode={mode} reduced={reduced} />
              <h1>{t('I think a lot. Then I build.', "Hi! I build things and I'm loud about it.")}</h1>
              <p className="hero-name">
                {profile.name} is a {profile.role.toLowerCase()} from {profile.location}.
              </p>
              <p className="hero-sub">{t('Quiet by default. Careful with details.', "Loud only around my people. You're in now.")}</p>
              <div className="hero-actions">
                <a className="btn btn-solid" href="#work">
                  See my work
                </a>
                <a className="btn btn-glass" href={`mailto:${profile.email}`}>
                  Email me
                </a>
              </div>
              <p className="note">{t('psst, flip the switch up top', 'okay, this is the real me')}</p>
            </div>
            <HeroCone mode={mode} />
          </section>

          {/* ---------- About ---------- */}
          <section id="about" className="section">
            <h2>{t('Inside my head', 'Outside my head')}</h2>
            <div className="about-grid">
              <GlassCard className="about-main">
                <p>
                  {t(
                    `I'm an Information Technology graduate from ${profile.school}. I like to think a problem all the way through before I touch the keyboard.`,
                    `Give me my closest friends and I turn into a completely different person. Loud. Silly. Zero volume control. Same brain, different flavor.`
                  )}
                </p>
                <p>
                  {t(
                    'I look for a stable junior developer role where I can learn fast, contribute what I know, and grow with a kind team.',
                    'I want a junior developer role with a kind, dynamic team. Bonus points if someone brings ice cream.'
                  )}
                </p>
              </GlassCard>
              <div className="facts">
                <GlassCard className="fact">
                  <h3>Quiet on the outside</h3>
                  <p>Most days I think more than I talk.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Loud with my people</h3>
                  <p>With my closest friends, I'm the silly one.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>A small circle</h3>
                  <p>I keep it small on purpose.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Cookies and cream</h3>
                  <p>My favorite flavor. Dark chocolate, coffee and tea are on the list too.</p>
                </GlassCard>
              </div>
            </div>
          </section>

          {/* ---------- Work ---------- */}
          <section id="work" className="section">
            <h2>Flavors I've made</h2>
            <p className="section-lead">
              {t(
                'Five projects. Pick up the phone to browse them, or scroll for the full list.',
                'Five flavors. Pick a scoop. Or pick up the phone and press all the buttons.'
              )}
            </p>
            <div className="work-grid">
              <div className="phone-col">
                <LazyMount minHeight={600}>
                  <div className={`phone-stage${loud ? ' is-loud' : ''}`}>
                    <PixelCursors />
                    <NokiaPhone
                      projects={projects}
                      profile={profile}
                      about={phoneAbout}
                      mode={mode}
                      onMode={setMode}
                      reduced={reduced}
                    />
                    <Splash active={loud} reduced={reduced} />
                  </div>
                </LazyMount>
                <p className="phone-hint">
                  {t('press Menu. try Snake. arrow keys work too.', 'go on, press Menu! then play Snake!')}
                </p>
              </div>
              <div className="projects">
                {projects.map((p) => (
                  <GlassCard as="article" className="project" key={p.id}>
                    <div className="project-top">
                      <span className="swatch" style={{ background: p.swatch }} aria-hidden="true" />
                      <span className="flavor">{p.flavor}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p className="project-kind">
                      {p.name !== p.title ? `${p.name}. ` : ''}
                      {p.kind}.
                    </p>
                    <p>{t(p.quiet, p.loud)}</p>
                    <ul className="tags">
                      {p.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <a className="project-link" href={p.link} target="_blank" rel="noreferrer">
                      View {p.title} on GitHub
                    </a>
                  </GlassCard>
                ))}
              </div>
            </div>
          </section>

          {/* ---------- Journey ---------- */}
          <section id="journey" className="section">
            <h2>Where I've learned</h2>
            <div className="journey">
              <GlassCard className="journey-card">
                <h3>{experience.role}</h3>
                <p className="journey-meta">
                  {experience.place}, {experience.where}. {experience.when}.
                </p>
                <ul>
                  {experience.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard className="journey-card">
                <h3>BS in Information Technology</h3>
                <p className="journey-meta">
                  {profile.school}, Iba, Zambales. {profile.schoolYears}.
                </p>
                <p>{t('This is where I built my capstone, BAAC.', 'This is where BAAC was born. Capstone survived.')}</p>
              </GlassCard>
            </div>
          </section>

          {/* ---------- Skills ---------- */}
          <section id="toppings" className="section">
            <h2>Toppings</h2>
            <div className="skills">
              {skills.map((s) => (
                <GlassCard className="skill-group" key={s.group}>
                  <h3>{s.group}</h3>
                  <ul className="tags">
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* ---------- Contact ---------- */}
          <section id="contact" className="section contact">
            <GlassCard className="contact-card">
              <h2>The small circle</h2>
              <p>
                {t(
                  "I keep my circle small. I'm looking for remote work. If you're building something and want a careful, quiet developer on it, write to me.",
                  "My circle is small, but there's room for one more. I'm looking for remote work. Say hi!"
                )}
              </p>
              <div className="hero-actions">
                <a className="btn btn-solid" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                <a className="btn btn-glass" href={profile.github} target="_blank" rel="noreferrer">
                  github.com/Vaujx
                </a>
              </div>
            </GlassCard>
          </section>
        </main>

        <footer className="footer">
          <p>Made with too much thinking, coffee, tea and one scoop of cookies and cream.</p>
        </footer>
      </div>
    </>
  )
}
