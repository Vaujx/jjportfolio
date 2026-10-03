import { useEffect, useState } from 'react'

// Pixel mouse cursors that point at the phone, plus Minecraft-style splash text.
// Both are only visible in loud mode.

const CURSOR = [
  'X...........',
  'XX..........',
  'XoX.........',
  'XooX........',
  'XoooX.......',
  'XooooX......',
  'XoooooX.....',
  'XooooooX....',
  'XoooooooX...',
  'XooooooooX..',
  'XoooooXXXXX.',
  'XooXooX.....',
  'XoX.XooX....',
  'XX..XooX....',
  'X....XooX...',
  '.....XooX...',
  '......XooX..',
  '......XooX..',
  '.......XX...',
]

// [x%, y%] around the phone. The tip of each cursor is turned toward the middle.
const SPOTS = [
  [-15, 5],
  [-17, 27],
  [-13, 50],
  [-16, 73],
  [-11, 93],
  [113, 10],
  [116, 33],
  [112, 57],
  [115, 80],
  [24, -5],
  [76, -6],
  [27, 105],
  [73, 105],
]

// Rough stage size, only used to work out which way each cursor should point.
const W = 300
const H = 590

function angleTo(x, y) {
  const dx = ((50 - x) / 100) * W
  const dy = ((50 - y) / 100) * H
  // The cursor art points up-left, which is -135 degrees.
  return (Math.atan2(dy, dx) * 180) / Math.PI + 135
}

function Cursor() {
  return (
    <svg
      className="pcursor-art"
      viewBox="0 0 12 19"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {CURSOR.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="1"
              height="1"
              fill={c === 'X' ? '#111111' : '#ffffff'}
            />
          )
        )
      )}
    </svg>
  )
}

export function PixelCursors() {
  return (
    <div className="cursors" aria-hidden="true">
      {SPOTS.map(([x, y], i) => (
        <div
          key={i}
          className="pcursor"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) rotate(${angleTo(x, y)}deg)`,
          }}
        >
          <div className="pcursor-inner" style={{ '--d': `${(i % 5) * 0.18}s` }}>
            <Cursor />
          </div>
        </div>
      ))}
    </div>
  )
}

const SPLASHES = [
  "It's interactive!",
  'Press the buttons!',
  'It plays Snake!',
  'Click me!',
  'Cookies and cream!',
]

export function Splash({ active, reduced }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => setI((n) => (n + 1) % SPLASHES.length), reduced ? 6500 : 4200)
    return () => clearInterval(id)
  }, [active, reduced])

  return (
    <div className="splash" aria-hidden="true">
      <span className="splash-text">{SPLASHES[i]}</span>
    </div>
  )
}

// A pixel telephone that orbits and spins, with ring waves. Loud mode only.
const PHONE = [
  '..XXXXXXXXXX..',
  '.XXXXXXXXXXXX.',
  'XXX........XXX',
  'XX..........XX',
  '.....XXXX.....',
  '..XXXXXXXXXX..',
  '.XXXXXXXXXXXX.',
  '.XXXXX..XXXXX.',
  '.XXXX.XX.XXXX.',
  '.XXXXX..XXXXX.',
  '.XXXXXXXXXXXX.',
  'XXXXXXXXXXXXXX',
]

export function SwirlPhone() {
  return (
    <div className="swirl" aria-hidden="true">
      <div className="swirl-orbit">
        <div className="swirl-ph">
          <svg viewBox="0 0 14 12" shapeRendering="crispEdges">
            {PHONE.flatMap((row, y) =>
              [...row].map((c, x) =>
                c === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null
              )
            )}
          </svg>
        </div>
      </div>
      <span className="swirl-ring">RING RING!</span>
    </div>
  )
}
