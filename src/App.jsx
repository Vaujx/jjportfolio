import { lazy, Suspense, useEffect, useState } from 'react'
import LiquidLogo from './components/LiquidLogo.jsx'
import GlassCard, { GlassFilter } from './components/GlassCard.jsx'
import NokiaPhone from './components/NokiaPhone.jsx'
import ProjectDesk from './components/ProjectDesk.jsx'
import { LinkedInIcon, GitHubIcon, MailIcon } from './components/Icons.jsx'
import { PixelCursors, Splash, SwirlPhone } from './components/PhoneFlair.jsx'
import ContactModal from './components/ContactModal.jsx'
import Grimoire from './components/Grimoire.jsx'
import Credits from './components/Credits.jsx'
import { BackToTop, Hl, Reveal, RevealText, ScrollProgress, useActiveSection } from './components/ScrollFx.jsx'
import { sfx, setSoundEnabled } from './sound.js'
import { profile, projects, experience, skills, phoneAbout } from './data.js'
import { useIdle, useInView } from './hooks.js'

const NAV_LINKS = [
  ['about', 'About'],
  ['work', 'Work'],
  ['journey', 'Journey'],
  ['contact', 'Contact'],
]
// Every section on the page, and which nav link it belongs to.
const SECTION_TO_NAV = {
  about: 'about',
  work: 'work',
  phone: 'work',
  journey: 'journey',
  toppings: 'journey',
  credits: 'journey',
  contact: 'contact',
}
const SECTION_IDS = Object.keys(SECTION_TO_NAV)

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
  const [contactOpen, setContactOpen] = useState(false)
  const activeNav = SECTION_TO_NAV[useActiveSection(SECTION_IDS)]
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem('jj-sound') === 'on'
    } catch {
      return false
    }
  })
  useEffect(() => {
    setSoundEnabled(sound)
    try {
      localStorage.setItem('jj-sound', sound ? 'on' : 'off')
    } catch {
      /* storage can be blocked, that's fine */
    }
  }, [sound])
  const toggleSound = () => {
    const next = !sound
    setSoundEnabled(next)
    setSound(next)
    if (next) sfx.select()
  }
  const openContact = () => setContactOpen(true)

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
      <ScrollProgress />
      <BackToTop loud={loud} />
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
              {NAV_LINKS.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={activeNav === id ? 'is-active' : ''}
                  aria-current={activeNav === id ? 'true' : undefined}
                >
                  {label}
                </a>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={loud}
              aria-label="Switch between quiet and cool mode"
              className="switch"
              onClick={() => setMode(loud ? 'quiet' : 'loud')}
            >
              <span className="switch-label">Quiet</span>
              <span className="switch-track">
                <span className="switch-knob" />
              </span>
              <span className="switch-label">Cool</span>
            </button>
          </GlassCard>
        </header>

        <main id="top">
          {/* ---------- Hero ---------- */}
          <section className="hero">
            <div className="hero-text">
              <p className="status">
                <span className="status-dot" aria-hidden="true" />
                Open to remote work <span className="status-sep">|</span> UTC+8
              </p>
              <LiquidLogo text="JJ" size={170} mode={mode} reduced={reduced} />
              <h1>{t('I think a lot. Then I build.', 'I think a lot. Then I build. Out loud.')}</h1>
              <p className="hero-name">
                I'm {profile.name}, a {profile.role.toLowerCase()} from {profile.location}.
              </p>
              <p className="hero-summary">
                {t(
                  <>
                    I'm an Information Technology graduate (<Hl>July 2026</Hl>). I build practical tools with{' '}
                    <Hl>JavaScript and Python</Hl>, including <Hl>AI-powered features</Hl> like chatbots and quiz
                    generators.
                  </>,
                  <>
                    IT graduate (<Hl>July 2026</Hl>). I build tools with <Hl>JavaScript and Python</Hl>, and I add{' '}
                    <Hl>AI</Hl> where it helps. Chatbots, quiz generators, file tools.
                  </>
                )}
              </p>
              <ul className="chips" aria-label="At a glance">
                <li>Graduated July 2026</li>
                <li>300-hour IT support internship</li>
                <li>5 featured projects</li>
                <li>JavaScript and Python</li>
              </ul>
              <div className="hero-actions">
                <a className="btn btn-solid" href="#work">
                  See my work
                </a>
                <button type="button" className="btn btn-glass" onClick={openContact}>
                  Email me
                </button>
                <a className="btn btn-glass" href={profile.cv} download>
                  Download CV
                </a>
              </div>
              <p className="note">{t('psst, flip the switch up top', 'quiet or cool, same me')}</p>
            </div>
            <HeroCone mode={mode} />
          </section>

          {/* ---------- About ---------- */}
          <section id="about" className="section">
            <h2>{t('The quiet side', 'The cool side')}</h2>
            <div className="about-grid">
              <GlassCard className="about-main">
                <RevealText
                  text={t(
                    `I'm an Information Technology graduate from ${profile.school}. I like to think a problem all the way through before I touch the keyboard.`,
                    `With my closest friends I get loud and silly. It's the same me, just with the volume up.`
                  )}
                />
                <RevealText
                  text={t(
                    'I look for a stable junior developer role where I can learn fast, contribute what I know, and grow with a kind team.',
                    'I want a junior developer role on a team that cares about good work and still laughs a lot.'
                  )}
                />
              </GlassCard>
              <div className="facts">
                <GlassCard className="fact">
                  <h3>Quiet with most people</h3>
                  <p>Most days I think more than I talk.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Loud with close friends</h3>
                  <p>That's where I'm the silly one.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>A small circle</h3>
                  <p>I keep it small on purpose.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Cookies and cream</h3>
                  <p>My favorite ice cream flavor.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Coffee, tea, dark chocolate</h3>
                  <p>All three, happily.</p>
                </GlassCard>
                <GlassCard className="fact">
                  <h3>Anime</h3>
                  <p>I like anime too.</p>
                </GlassCard>
              </div>
            </div>
            <h3 className="offer-title">{t('What I can build for you', 'What we can build together')}</h3>
            <div className="offer">
              <Reveal delay={0}>
              <GlassCard className="offer-card">
                <h4>Web apps and tools</h4>
                <p>Clear, fast interfaces in JavaScript, HTML and CSS, with a Python back end such as Flask when needed.</p>
              </GlassCard>
              </Reveal>
              <Reveal delay={80}>
              <GlassCard className="offer-card">
                <h4>AI-powered features</h4>
                <p>Chatbots and content tools on top of <Hl>AI APIs</Hl>, like my barangay assistant and my quiz generator.</p>
              </GlassCard>
              </Reveal>
              <Reveal delay={160}>
              <GlassCard className="offer-card">
                <h4>Automation and file tools</h4>
                <p>Python and browser tools that rename, sort and convert files, like GIF Forge and DESKMAN.</p>
              </GlassCard>
              </Reveal>
              <Reveal delay={240}>
              <GlassCard className="offer-card">
                <h4>IT support</h4>
                <p>Hands-on hardware and network troubleshooting from my <Hl>300-hour internship</Hl>.</p>
              </GlassCard>
              </Reveal>
            </div>
          </section>

          {/* ---------- Work ---------- */}
          <section id="work" className="section">
            <h2>Flavors I've made</h2>
            <p className="section-lead">
              {t(
                'Five projects, five folders. Drag one onto the TV to open it.',
                'Five flavors, five folders. Drop one on the TV.'
              )}
            </p>
            <ProjectDesk projects={projects} mode={mode} reduced={reduced} />
          </section>

          {/* ---------- Phone ---------- */}
          <section id="phone" className="section">
            <div className="phone-head">
              <h2>{t('Or pick up the phone', 'Hire me maybe')}</h2>
              {loud && <SwirlPhone />}
            </div>
            <p className="section-lead">
              {t(
                'It has Snake, my contacts, and a switch between Quiet and Cool.',
                'It plays Snake, holds my contacts and switches modes.'
              )}
            </p>
            <div className="phone-wrap">
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
                {t('press Menu. try Snake. arrow keys work too.', 'press Menu. then play Snake.')}
              </p>
              <button type="button" className="sound-toggle" aria-pressed={sound} onClick={toggleSound}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  {sound ? <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
                </svg>
                Phone sound: {sound ? 'on' : 'off'}
              </button>
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
                    <li key={pt}>{pt === experience.points[0] ? <><Hl>300-hour</Hl> On-the-Job Training practicum.</> : pt}</li>
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

          {/* ---------- Credits ---------- */}
          <section id="credits" className="section">
            <h2>{t('Standing on good shoulders', 'Respect to the makers')}</h2>
            <p className="section-lead">
              {t(
                'Open source work and the platforms behind this site. Hover the cards.',
                'Their work powers this site. Hover the cards.'
              )}
            </p>
            <Credits />
          </section>

          {/* ---------- Contact ---------- */}
          <section id="contact" className="section contact">
            {loud && <Grimoire onHire={openContact} />}
            <Reveal>
              <GlassCard className="contact-card">
                <h2>{t('The small circle', "Contact me! I'm a developer for hire!")}</h2>
                <p>
                  {t(
                    <>
                      I keep my circle small. I'm looking for <Hl>remote work</Hl>. If you're building something and
                      want a careful, quiet developer on it, write to me.
                    </>,
                    <>
                      My circle is small, but there's room for one more. I'm looking for <Hl>remote work</Hl>. Hire
                      me, say hi, or both!
                    </>
                  )}
                </p>
                <div className="hero-actions">
                  <button type="button" className={`btn btn-solid${loud ? ' btn-hire' : ''}`} onClick={openContact}>
                    {loud ? 'HIRE ME!' : 'Write me a message'}
                  </button>
                  <a className="btn btn-glass" href={profile.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                  <a className="btn btn-glass" href={profile.github} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a className="btn btn-glass" href={profile.cv} download>
                    Download CV
                  </a>
                </div>
                <p className="contact-mail">
                  Or email{' '}
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </p>
              </GlassCard>
            </Reveal>
          </section>
        </main>

        <footer className="footer">
          <div className="social">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="John James Dayap on LinkedIn">
              <LinkedInIcon />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="John James Dayap on GitHub">
              <GitHubIcon />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email John James Dayap">
              <MailIcon />
            </a>
          </div>
          <p>Made with too much thinking, coffee, tea and one scoop of cookies and cream.</p>
          <p className="footer-legal">
            Hosted on{' '}
            <a href="https://vercel.com" target="_blank" rel="noreferrer">
              Vercel
            </a>
            . Code on{' '}
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            . Built with React and Vite.
          </p>
          <p className="footer-legal">
            &copy; {new Date().getFullYear()} {profile.name.replace(' Dayap', ' M. Dayap')}. All rights reserved.
          </p>
          <p className="footer-legal footer-fine">
            Anime quotes belong to their creators and are shown as a fan tribute. The tools credited above belong to
            their makers.
          </p>
        </footer>
      </div>
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        email={profile.email}
        endpoint={profile.formEndpoint}
      />
    </>
  )
}
