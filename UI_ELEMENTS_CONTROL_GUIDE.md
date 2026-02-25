# Portfolio UI Elements Control Guide

This guide explains where each major visual/content element lives and what to edit to control it.

## 1) Mountains (foreground + background)

### Where it is
- Structure: `src/components/BackgroundScene.tsx`
	- Container: `div.mountains-container`
	- Back layer: `svg.mountain-layer`
	- Front layer: `svg.mountain-layer.front`

### What to edit
- File: `src/index.css`
- Back mountain color: `--mountain-back` (theme variables at top of file)
- Front mountain color: `--mountain-front`
- Mountain overall height on screen:
	- `.mountains-container { height: 55vh; }`
- Horizontal width/coverage:
	- `.mountain-layer { left: -35%; width: 170%; }`
- Detail camera parallax shift:
	- `.mountains-container.detail-pov-right`
	- `.mountains-container.detail-pov-left`

## 2) Snow

### Where it is
- File: `src/components/BackgroundScene.tsx`
- Component: `Snow`

### What to edit
- Snow density: `const count = 16000`
- Snow spread:
	- X spread: `(Math.random() - 0.5) * 600`
	- Y range: `Math.random() * 1000 - 500`
	- Z depth: `(Math.random() - 0.5) * 2000`
- Fall speed: `spd[i] = Math.random() * 0.8 + 0.1`
- Dot size/opacity: `pointsMaterial size={2.5} ... opacity={0.6}`

### Theme visibility control
- File: `src/index.css`
- Light theme enables snow: `--snow-opacity: 1`
- Container uses that value: `.snow-canvas-container { opacity: var(--snow-opacity, 0); }`

## 3) Stars (twinkling field)

### Where it is
- File: `src/components/BackgroundScene.tsx`
- Component: `TwinklingStars`

### What to edit
- Star count: `const count = 5000`
- Star spread: `(Math.random() - 0.5) * 2000`
- Star size range: `siz[i] = Math.random() * 2.5 + 0.5`
- Twinkle speed: `spd[i] = Math.random() * 2.0 + 0.5`

### Shader controls (same file)
- Point size perspective multiplier: `gl_PointSize = size * (300.0 / -mvPosition.z)`
- Edge softness: `smoothstep(0.5, 0.1, ...)`
- Twinkle intensity floor: `0.3 + 0.7 * (...)`

### Theme visibility control
- File: `src/index.css`
- `--stars-opacity` in theme blocks
- Applied at `.webgl-canvas-container { opacity: var(--stars-opacity); }`

## 4) Shooting stars

### Where it is
- File: `src/components/BackgroundScene.tsx`
- Component: `ShootingStar`
- Instances are mounted in JSX under the stars canvas

### What to edit
- Frequency: `interval` prop
- On-screen time: `duration` prop
- Stagger timing: `offsetDelay` prop
- Start position ranges:
	- X: `(Math.random() - 0.5) * 1000`
	- Y: `500 + Math.random() * 200`
	- Z: `-1000`
- Velocity ranges:
	- X: `(-300 - Math.random() * 200)`
	- Y: `(-200 - Math.random() * 100)`

## 5) Detail data content (main right panel)

### Where it is
- File: `src/App.tsx`
- Object: `DETAIL_DATA: Record<string, React.ReactNode>`

### How to edit
- Each section (`About`, `Education`, `Projects`, etc.) is its own JSX block.
- Change text directly in each section.
- For projects detail, data source is `PROJECT_DETAILS` array.

## 6) Detail sidebar info (left-side text in detail mode)

### Where it is
- File: `src/App.tsx`
- Object: `DETAIL_SIDEBAR_INFO: Record<string, React.ReactNode>`

### How to edit
- Each key maps to a short purpose/summary.
- Use string for simple text or JSX (`<>...</>`) for multi-paragraph content.

## 7) Detail panel (rectangle box) + opacity control

### Where it is
- File: `src/index.css`
- Main class: `.detail-panel`

### Most important controls
- Panel size:
	- `width: min(42vw, 620px)`
	- `max-height: calc(100vh - 140px)`
- Fade in/out:
	- `opacity: 0` in `.detail-panel`
	- `opacity: 1` in `.detail-panel.visible`
	- `transition: opacity 0.4s ease`
- Background transparency (this is the rectangle opacity):
	- Dark/Night: `.detail-panel { background: rgba(10, 14, 24, 0.01); }`
	- Light theme: `[data-theme="Light"] .detail-panel { background: rgba(245, 248, 252, 0.1); }`
	- Mobile overlay: `.detail-panel.mobile { background: rgba(5, 10, 20, 0.1); }`

### How opacity values work
- `rgba(..., A)` where `A` is alpha:
	- `A = 0.0` fully transparent
	- `A = 1.0` fully opaque
- Increase alpha for stronger box, decrease for more glass effect.

## 8) Camera shift direction by section

### Where it is
- File: `src/App.tsx`
- `LEFT_SHIFT_TOPICS` controls which sections move left in detail mode.

### How to edit
- Add/remove section names in this set:
	- `const LEFT_SHIFT_TOPICS = new Set([...])`
- Everything not in this set shifts right.

## 9) Quick edit map

- Content summary text: `CONTENT_DATA` in `src/App.tsx`
- Full detail text: `DETAIL_DATA` in `src/App.tsx`
- Left detail helper text: `DETAIL_SIDEBAR_INFO` in `src/App.tsx`
- Project list/detail text: `PROJECTS` and `PROJECT_DETAILS` in `src/App.tsx`
- 3D scene behavior (stars/snow/shooting/camera): `src/components/BackgroundScene.tsx`
- All visual styling and opacity: `src/index.css`

## 10) Back button position control

### Where it is
- File: `src/index.css`
- Class: `.back-button`

### Position properties
- `position: fixed` keeps it pinned to the viewport.
- `top` controls vertical position:
	- smaller `top` value = moves up
	- larger `top` value = moves down
- `left` controls horizontal position:
	- smaller `left` value = moves left
	- larger `left` value = moves right

### Example
- Current values:
	- `top: 1.5rem;`
	- `left: 2.25rem;`

If you want it a bit higher, try `top: 1rem;`.

