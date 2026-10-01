import { useEffect, useRef, useState } from 'react'
import { lowPower } from '../hooks.js'

// A liquid-metal monogram, inspired by collidingScopes/liquid-logo.
// The text is drawn to a 2D canvas, used as a texture, and a fragment shader
// turns its blurred edges into a flowing chrome surface.

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float height(vec2 uv) {
  float s = 0.0;
  float w = 0.0;
  for (int i = -2; i <= 2; i++) {
    for (int j = -2; j <= 2; j++) {
      float k = exp(-float(i * i + j * j) / 4.0);
      s += texture2D(u_tex, uv + vec2(float(i), float(j)) * 0.012).a * k;
      w += k;
    }
  }
  return s / w;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.35;

  vec2 flow = vec2(
    noise(uv * 5.0 + vec2(t, -t)),
    noise(uv * 5.0 + vec2(-t, t) + 7.0)
  ) - 0.5;

  float mask = texture2D(u_tex, uv + flow * 0.02).a;
  float h = height(uv);
  float e = 0.006;
  vec2 grad = vec2(
    height(uv + vec2(e, 0.0)) - height(uv - vec2(e, 0.0)),
    height(uv + vec2(0.0, e)) - height(uv - vec2(0.0, e))
  );

  vec3 n = normalize(vec3(-grad * 40.0 + flow * 0.9 + (u_mouse - 0.5) * 0.5, 1.0));
  float fres = pow(1.0 - n.z, 2.0);
  float band = sin(n.x * 6.0 + n.y * 5.0 + t * 2.0 + h * 6.0) * 0.5 + 0.5;

  vec3 col = mix(u_a, u_b, band);
  col = mix(col, u_c, smoothstep(0.55, 1.0, sin(n.y * 9.0 - t * 3.0) * 0.5 + 0.5) * 0.6);
  col += fres * 0.35;
  col += pow(max(n.z, 0.0), 24.0) * 0.35;

  gl_FragColor = vec4(col * mask, mask);
}`

const palettes = {
  quiet: { a: [0.62, 0.66, 0.92], b: [0.1, 0.12, 0.32], c: [0.92, 0.95, 1.0] },
  loud: { a: [1.0, 0.52, 0.7], b: [0.42, 0.24, 0.15], c: [1.0, 0.93, 0.82] },
}

function makeTextCanvas(text) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const x = c.getContext('2d')
  x.clearRect(0, 0, 512, 512)
  x.fillStyle = '#ffffff'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.font = '900 300px "Fraunces", Georgia, serif'
  x.fillText(text, 256, 285)
  return c
}

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s))
    return null
  }
  return s
}

export default function LiquidLogo({ text = 'JJ', size = 280, mode = 'quiet', reduced = false }) {
  const canvasRef = useRef(null)
  const modeRef = useRef(mode)
  const reducedRef = useRef(reduced)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true })
    if (!gl) {
      setFallback(true)
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    gl.viewport(0, 0, canvas.width, canvas.height)

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) {
      setFallback(true)
      return
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, makeTextCanvas(text))
    }
    upload()
    // Redraw the texture once the web font is ready.
    let alive = true
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load('900 300px Fraunces')
        .then(() => alive && upload())
        .catch(() => {})
    }

    const u = (n) => gl.getUniformLocation(prog, n)
    const uTime = u('u_time')
    const uMouse = u('u_mouse')
    const uA = u('u_a')
    const uB = u('u_b')
    const uC = u('u_c')
    gl.uniform1i(u('u_tex'), 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const cur = {
      a: [...palettes[modeRef.current].a],
      b: [...palettes[modeRef.current].b],
      c: [...palettes[modeRef.current].c],
    }
    const mouse = [0.5, 0.5]
    const target = [0.5, 0.5]

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      target[0] = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
      target[1] = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height))
    }
    window.addEventListener('pointermove', onMove)

    let raf = 0
    let visible = true
    const start = performance.now()
    const draw = () => {
      const goal = palettes[modeRef.current]
      for (const k of ['a', 'b', 'c']) {
        for (let i = 0; i < 3; i++) cur[k][i] += (goal[k][i] - cur[k][i]) * 0.06
      }
      mouse[0] += (target[0] - mouse[0]) * 0.08
      mouse[1] += (target[1] - mouse[1]) * 0.08

      const t = reducedRef.current ? 2.0 : (performance.now() - start) / 1000
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, t)
      gl.uniform2f(uMouse, mouse[0], mouse[1])
      gl.uniform3fv(uA, cur.a)
      gl.uniform3fv(uB, cur.b)
      gl.uniform3fv(uC, cur.c)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = visible ? requestAnimationFrame(draw) : 0
    }
    draw()

    // Stop drawing while the logo is scrolled out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(draw)
      },
      { rootMargin: '100px' }
    )
    io.observe(canvas)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
    }
  }, [text, size])

  if (fallback) {
    return (
      <div className="logo-fallback" style={{ width: size, height: size }} aria-label={text}>
        {text}
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="liquid-logo"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${text} monogram`}
    />
  )
}
