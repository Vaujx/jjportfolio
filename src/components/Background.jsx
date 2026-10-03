import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { lowPower } from '../hooks.js'

// Two moods for the same gradient.
// Quiet: deep indigo, slow, calm.
// Cool: crimson and near-black, faster and wavier.
const presets = {
  quiet: {
    color1: '#1a1d4a',
    color2: '#4b52c9',
    color3: '#0a0b1e',
    uSpeed: 0.08,
    uStrength: 1.4,
    uDensity: 1.1,
    uFrequency: 5.5,
    brightness: 0.9,
  },
  loud: {
    color1: '#c1121f',
    color2: '#ff4d6d',
    color3: '#1a0508',
    uSpeed: 0.3,
    uStrength: 2.4,
    uDensity: 1.6,
    uFrequency: 5.5,
    brightness: 0.95,
  },
}

export default function Background({ mode, reduced }) {
  const p = presets[mode]
  return (
    <div className="bg-canvas" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0 }}
        pixelDensity={lowPower ? 0.6 : 1}
        fov={45}
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate={reduced ? 'off' : 'on'}
          {...p}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={2.8}
          cameraZoom={9}
          lightType="3d"
          envPreset="city"
          grain="on"
          reflection={0.1}
        />
      </ShaderGradientCanvas>
    </div>
  )
}
