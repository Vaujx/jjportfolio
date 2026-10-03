import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { lowPower } from '../hooks.js'

// Bottom scoop: dark chocolate. Top scoop: cookies and cream.
const colors = {
  quiet: { bottom: '#3a2117', top: '#f1eadf', cherry: '#8f9bff' },
  loud: { bottom: '#3a1a14', top: '#fff4e6', cherry: '#ff2d55' },
}

function Crumbs() {
  const items = useMemo(
    () =>
      Array.from({ length: 30 }, () => {
        const theta = Math.random() * Math.PI * 2
        const y = Math.random() * 2 - 1
        const r = Math.sqrt(1 - y * y) * 0.69
        const size = 0.06 + Math.random() * 0.07
        return {
          pos: [r * Math.cos(theta), y * 0.69, r * Math.sin(theta)],
          rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
          size,
        }
      }),
    []
  )
  return (
    <group position={[0, 1.15, 0]}>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} rotation={it.rot}>
          <boxGeometry args={[it.size, it.size * 0.5, it.size * 0.8]} />
          <meshStandardMaterial color="#1c110c" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Sprinkles({ loud }) {
  const group = useRef()
  const items = useMemo(() => {
    const palette = ['#ffffff', '#ffd166', '#5ad6ff', '#ff5d8f', '#ff9f43']
    return Array.from({ length: 46 }, (_, i) => {
      // Random point on the upper hemisphere of the top scoop.
      const u = Math.random()
      const v = Math.random() * 0.7 + 0.15
      const theta = u * Math.PI * 2
      const phi = Math.acos(1 - v)
      const r = 0.68
      return {
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        ],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        color: palette[i % palette.length],
      }
    })
  }, [])

  useFrame((_, dt) => {
    const s = group.current.scale.x
    const goal = loud ? 1 : 0.001
    const next = s + (goal - s) * Math.min(1, dt * 6)
    group.current.scale.setScalar(next)
  })

  return (
    <group ref={group} position={[0, 1.15, 0]} scale={0.001}>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} rotation={it.rot}>
          <boxGeometry args={[0.16, 0.04, 0.04]} />
          <meshStandardMaterial color={it.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function Cone({ mode }) {
  const root = useRef()
  const bottom = useRef()
  const top = useRef()
  const cherry = useRef()
  const goal = useMemo(
    () => ({
      quiet: {
        bottom: new THREE.Color(colors.quiet.bottom),
        top: new THREE.Color(colors.quiet.top),
        cherry: new THREE.Color(colors.quiet.cherry),
      },
      loud: {
        bottom: new THREE.Color(colors.loud.bottom),
        top: new THREE.Color(colors.loud.top),
        cherry: new THREE.Color(colors.loud.cherry),
      },
    }),
    []
  )
  const loud = mode === 'loud'

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const g = goal[mode]
    bottom.current.color.lerp(g.bottom, 0.08)
    top.current.color.lerp(g.top, 0.08)
    cherry.current.color.lerp(g.cherry, 0.08)

    // Quiet: slow float. Loud: bouncy and spinning.
    const speed = loud ? 3.2 : 0.9
    const amp = loud ? 0.22 : 0.1
    root.current.position.y = Math.sin(t * speed) * amp
    root.current.rotation.y += dt * (loud ? 1.4 : 0.25)
    const px = state.pointer.x
    const py = state.pointer.y
    root.current.rotation.x += (-py * 0.25 - root.current.rotation.x) * 0.06
    root.current.rotation.z += (-px * 0.2 - root.current.rotation.z) * 0.06
  })

  return (
    <group ref={root} position={[0, -0.2, 0]}>
      {/* cone, tip pointing down */}
      <mesh position={[0, -0.9, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.72, 1.8, 40]} />
        <meshStandardMaterial color="#e0a458" roughness={0.75} />
      </mesh>
      {/* first scoop */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.86, 48, 48]} />
        <meshStandardMaterial ref={bottom} color={colors.quiet.bottom} roughness={0.35} />
      </mesh>
      {/* second scoop */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.68, 48, 48]} />
        <meshStandardMaterial ref={top} color={colors.quiet.top} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.92, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial ref={cherry} color={colors.quiet.cherry} roughness={0.25} />
      </mesh>
      <Crumbs />
      <Sprinkles loud={loud} />
    </group>
  )
}

export default function IceCream({ mode, active = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 6.2], fov: 35 }}
      dpr={lowPower ? 1 : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true }}
      aria-label="A 3D ice cream cone that follows your cursor"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -1, 2]} intensity={0.8} color="#9aa2ff" />
      <Cone mode={mode} />
    </Canvas>
  )
}
