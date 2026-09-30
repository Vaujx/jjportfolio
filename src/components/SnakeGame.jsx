import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

// Snake for the phone screen. Walls wrap around, like the classic.
// The phone sends directions in through the ref: game.turn('up' | 'down' | 'left' | 'right').

const COLS = 21
const ROWS = 13
const CELL = 10

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

function placeFood(snake) {
  const taken = new Set(snake.map((s) => `${s.x},${s.y}`))
  const free = []
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

function freshGame() {
  const snake = [
    { x: 10, y: 6 },
    { x: 9, y: 6 },
    { x: 8, y: 6 },
  ]
  return { snake, dir: 'right', queue: [], food: placeFood(snake), score: 0 }
}

const SnakeGame = forwardRef(function SnakeGame({ onState }, ref) {
  const canvasRef = useRef(null)
  const game = useRef(freshGame())
  const timer = useRef(null)
  const statusRef = useRef('ready')
  const [ui, setUi] = useState({ status: 'ready', score: 0 })

  const setStatus = (status) => {
    statusRef.current = status
    setUi({ status, score: game.current.score })
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const ink = getComputedStyle(canvas).getPropertyValue('--lcd-ink').trim() || '#1b2a19'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = ink
    ctx.strokeStyle = ink
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)
    for (const seg of game.current.snake) {
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2)
    }
    const f = game.current.food
    if (f) {
      // a little plus sign, so food never looks like a snake segment
      const cx = f.x * CELL
      const cy = f.y * CELL
      ctx.fillRect(cx + 4, cy + 1, 2, 8)
      ctx.fillRect(cx + 1, cy + 4, 8, 2)
    }
  }

  const stop = () => {
    clearTimeout(timer.current)
    timer.current = null
  }

  const tick = () => {
    const g = game.current
    if (g.queue.length) g.dir = g.queue.shift()
    const d = DIRS[g.dir]
    const head = g.snake[0]
    const next = {
      x: (head.x + d.x + COLS) % COLS,
      y: (head.y + d.y + ROWS) % ROWS,
    }
    const eating = g.food && next.x === g.food.x && next.y === g.food.y
    const body = eating ? g.snake : g.snake.slice(0, -1)
    if (body.some((s) => s.x === next.x && s.y === next.y)) {
      stop()
      draw()
      setStatus('over')
      return
    }
    g.snake.unshift(next)
    if (eating) {
      g.score += 1
      g.food = placeFood(g.snake)
      setUi({ status: 'playing', score: g.score })
    } else {
      g.snake.pop()
    }
    draw()
    timer.current = setTimeout(tick, Math.max(70, 150 - g.score * 4))
  }

  const start = () => {
    if (statusRef.current === 'over') game.current = freshGame()
    setStatus('playing')
    stop()
    draw()
    timer.current = setTimeout(tick, 150)
  }

  const pause = () => {
    stop()
    setStatus('paused')
  }

  const queueDir = (dir) => {
    const g = game.current
    const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir
    if (dir === last || dir === OPPOSITE[last]) return
    if (g.queue.length < 2) g.queue.push(dir)
  }

  useImperativeHandle(ref, () => ({
    turn(dir) {
      const s = statusRef.current
      if (s === 'over') return
      if (s === 'ready') {
        start()
        if (dir !== 'left') queueDir(dir)
        return
      }
      if (s === 'paused') {
        start()
      }
      queueDir(dir)
    },
    primary() {
      const s = statusRef.current
      if (s === 'playing') pause()
      else start()
    },
  }))

  useEffect(() => {
    if (onState) onState(ui)
  }, [ui]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    draw()
    return stop
  }, [])

  const messages = {
    ready: ['Snake', 'Press 2 4 6 8', 'or the arrows'],
    paused: ['Paused', 'Press Play'],
    over: ['Game over', `Score ${ui.score}`, 'Press Retry'],
  }
  const msg = messages[ui.status]

  return (
    <div className="snake-wrap">
      <canvas
        ref={canvasRef}
        className="snake-canvas"
        width={COLS * CELL}
        height={ROWS * CELL}
        aria-label="Snake game"
      />
      {msg && (
        <div className="snake-msg">
          {msg.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}
    </div>
  )
})

export default SnakeGame
