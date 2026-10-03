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

## Performance notes

- Smooth scrolling uses Lenis. It is skipped for people who prefer reduced motion.
- The 3D cone and the shader background load in separate files after the page paints.
- The phone loads when you scroll near it.
- The cone and the liquid logo stop drawing when they are off screen.
- Phones and weaker devices get a lower render resolution automatically.
- Tune the scroll feel in `src/App.jsx`: change `lerp: 0.09`. Lower is smoother and slower.

## CV

The CV is `public/John-James-Dayap-CV.pdf`. It has no address, phone, birth date or height.
To update it, replace that file with a new PDF that has the same name.

## Project folders and the TV

- Projects live in `src/data.js`. Each one has a `link` (GitHub), and two optional fields:
  - `live`: a live demo URL. If set, the TV window shows a "Try live demo" button that opens it inside the TV.
  - `image`: a screenshot path, for example `/shots/baac.png`. Put the image file in `public/shots/`.
- GitHub pages cannot be shown inside the TV, because GitHub blocks embedding. The TV shows your project details and a button to open GitHub.
- Some live sites also block embedding. The TV window always has an "Open it in a new tab" link.

## Email popup

The "Email me" button opens a pixel message window.

- By default it opens the visitor's email app with the message filled in.
- To send messages straight from the page, make a free form at formspree.io, then paste its URL into `formEndpoint` in `src/data.js`.

## Loud mode extras

- The swirling phone is in `PhoneFlair.jsx`.
- The flying cat and "HIIIIRREE MEEE~~~" marquee are in `HireBand.jsx`. Change the `WORDS` list to change the text.
- Scroll effects (word-by-word text, highlighter, TV tuning in) are in `ScrollFx.jsx`.
- Credits and their hover animations are in `Credits.jsx`.
