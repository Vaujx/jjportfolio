# JJ Portfolio

Quiet mode and loud mode. One person.

## Run it

```bash
npm install
npm run dev
```

If npm complains about peer dependencies, run `npm install --legacy-peer-deps`.

## Deploy on Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, click **Add New Project** and import the repo.
3. Vercel detects Vite. Keep the defaults and deploy.

## Edit your content

Everything you read on the page lives in `src/data.js`.
Add new projects there.

## What is where

- `src/components/Background.jsx`: ShaderGradient background. Two presets, one per mode.
- `src/components/LiquidLogo.jsx`: liquid-metal "JJ", inspired by collidingScopes/liquid-logo.
- `src/components/GlassCard.jsx`: glass surfaces, inspired by dashersw/liquid-glass-js.
- `src/components/IceCream.jsx`: the 3D ice cream (dark chocolate and cookies and cream), built with React Three Fiber.
- `src/components/SnakeGame.jsx`: the Snake game. Arrow keys or the 2 4 6 8 keys. Walls wrap around.
- `src/components/PhoneFlair.jsx`: pixel cursors and Minecraft-style splash text. Loud mode only. Edit the `SPLASHES` list to change the messages.
- `public/`: the JJ favicon (SVG plus PNG fallbacks).
- `src/components/NokiaPhone.jsx`: the Nokia-style phone that browses your projects. Keys, screen taps and keyboard all work.
