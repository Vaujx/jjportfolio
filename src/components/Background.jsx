import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

// Two moods for the same gradient.
// Quiet: deep indigo, slow, calm.
// Loud: strawberry, caramel and cream, fast and wobbly.
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
    color1: '#ff9ab8',
    color2: '#e8b27a',
    color3: '#fff0dc',
    uSpeed: 0.45,
    uStrength: 3.2,
    uDensity: 2.2,
    uFrequency: 5.5,
    brightness: 1.2,
  },
}

export default function Background({ mode, reduced }) {
  const p = presets[mode]
  return (
    <div className="bg" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0 }}
        pixelDensity={1}
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
