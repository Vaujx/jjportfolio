// Liquid glass surfaces, inspired by dashersw/liquid-glass-js.
// This version is CSS only: blur, a light-following highlight, and on
// Chromium browsers an SVG displacement filter for real refraction.

export function GlassFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0 }}
    >
      <defs>
        <filter id="liquid-glass" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.012"
            numOctaves="2"
            seed="7"
            result="turb"
          />
          <feGaussianBlur in="turb" stdDeviation="3" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale="45"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  )
}

export default function GlassCard({ as: Tag = 'div', className = '', children, onPointerMove, ...rest }) {
  const onMove = (e) => {
    if (onPointerMove) onPointerMove(e)
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <Tag className={`glass ${className}`} onPointerMove={onMove} {...rest}>
      {children}
    </Tag>
  )
}
