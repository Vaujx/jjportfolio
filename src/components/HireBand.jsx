import { useInView } from '../hooks.js'

// Loud mode only: a marquee with a pixel cat flying across, trailing a rainbow.
// The cat is an original design. Animations pause while the band is off screen.

const CAT = [
  'KK............KcKccccKcK',
  'KcK...........KcccppcccK',
  'KcKKKKKKKKKKKKKKccccccK.',
  'KcKooccooccooccKKKKKKKK.',
  '..KooccooccooccK........',
  '..KccccccccccccK........',
  '..KKKKKKKKKKKKKK........',
  '...KcK..KcK...KcK..KcK..',
  '...KKK..KKK...KKK..KKK..',
]

// The first three rows of the full sprite (ears and face) sit above the table rows.
const CAT_TOP = [
  '..............K....K....',
  '..............KcK.KcK...',
  '..............KccKKccK..',
  '..............KccccccccK',
]

const COLORS = { K: '#1c100a', c: '#f2dcc0', o: '#7a4a32', p: '#ff7aa8' }
const SPRITE = [...CAT_TOP, ...CAT]
const COLS = SPRITE[0].length

function Cat() {
  return (
    <svg
      className="cat-art"
      viewBox={`0 0 ${COLS} ${SPRITE.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {SPRITE.flatMap((row, y) =>
        [...row].map((c, x) =>
          COLORS[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[c]} /> : null
        )
      )}
    </svg>
  )
}

const WORDS = ['HIIIIRREE', 'MEEE~~~', "I'M", 'A', 'DEVELOPER', 'FOR', 'HIRE!']

export default function HireBand() {
  const [ref, inView] = useInView('0px')
  const run = WORDS.map((w, i) => (
    <span key={i} className="hire-word" style={{ '--i': i }}>
      {w}
    </span>
  ))
  return (
    <div ref={ref} className={`hire${inView ? ' is-live' : ''}`} aria-hidden="true">
      <div className="hire-sky">
        <div className="cat-fly">
          <div className="cat-trail">
            <i className="puff" />
            <i className="puff" />
            <i className="puff" />
          </div>
          <div className="cat-bob">
            <Cat />
          </div>
        </div>
      </div>
      <div className="hire-marquee">
        <div className="hire-track">
          <div className="hire-run">{run}</div>
          <div className="hire-run">{run}</div>
        </div>
      </div>
    </div>
  )
}
