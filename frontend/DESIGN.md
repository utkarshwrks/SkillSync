# SkillSync — Front-end Design System

The UI language: **charcoal + violet, premium, restrained** (Linear / Attio /
Arc / Notion tier). Not crypto, neon, gaming, or heavy glassmorphism.

## Tokens (`tailwind.config.js`)

| Token | Value | Use |
|-------|-------|-----|
| `night-950` | `#0A0A0A` | app background (charcoal) |
| `night-900` | `#111111` | raised card surface |
| `night-800` | `#171717` | hover surface |
| `brand-*` | indigo scale | primary controls / focus |
| `plum-400/500` | `#c084fc` / `#a855f7` | violet accents |
| `aqua-*` | cyan | used sparingly only |
| success | `#22c55e` (emerald) | verified / positive |
| text | `#FAFAFA` · muted `#A1A1AA` | |

Gradient: `brand-gradient` = violet `#7C3AED` → indigo `#6366F1` → purple
`#A855F7`. Use sparingly (CTAs, key accents, charts).

Fonts: **Sora** (display) + **Inter** (body); mono/tabular for numbers.

## Component classes (`src/index.css`)

- `.panel` / `.panel-hover` — solid `#111` card with hairline border, soft
  depth, inset top highlight. The primary surface.
- `.glass` / `.glass-hover` — restrained translucent card (used sparingly).
- `.btn-primary` (gradient + hover shimmer + lift), `.btn-ghost`.
- `.input`, `.chip`, `.icon-badge` (glows on group hover), `.gradient-text`
  (animated), `.stat-num` (tabular mono), `.rule` (hairline divider),
  `.link-underline`.

## Primitives (`src/components/ui.js`)

`Button`, `Panel`, `Badge`, `Avatar`, `Skeleton` / `SkeletonCard`,
`EmptyState`, `Tabs`, `Tooltip`, `ProgressStepper`, `Modal`, `Spinner`.

## Feedback

`ToastProvider` + `useToast()` (`src/components/Toast.js`) — bottom-right,
auto-dismiss, success/error/info tones.

## Data-viz (`src/components/charts.js`)

`RadialScore`, `BarMeter`, `AreaTrend`, `Sparkline`, `Funnel` — all SVG +
Framer Motion, animate on scroll, GPU-friendly. Shared gradient defs via
`<ChartDefs/>` (ids `sk-grad`, `sk-area`).

## Motion (`src/lib/motion.js` + `components/Reveal.js`, `CountUp.js`)

- Variants: `fadeUp`, `stagger`, `scaleIn` (easing `[0.22,1,0.36,1]`).
- `<Reveal>` — scroll-into-view fade/stagger. `<CountUp>` — animated numbers.
- App pages enter with the `animate-rise-in` CSS animation on their root.

## Space theme & 3D scroll

- **`AnimatedBackground`** — deep-space (`#04060F`): 4 layered twinkling
  starfields (each parallaxes with scroll at its own depth), nebula clouds, a
  periodic shooting star, radial light + vignette.
- **`scroll3d.js`** — scroll-driven 3D (CSS transforms only, no WebGL):
  - `Section3D` — sections **emerge from behind the screen** (scale far→near,
    blur→sharp, fade) as they enter.
  - `HeroTilt` — the hero panel tilts in 3D as it scrolls past.
  - `Parallax` — depth layers.
  - `useLite()` — returns lite mode for **small screens / reduced-motion**:
    drops blur, softens scale/rotation, lightens parallax so phones stay smooth.
- **`WarpSplash`** — one-time-per-session "hyperspace" intro (star-streaks +
  logo warp-in + zoom-reveal); skipped under reduced-motion.
- The landing's flywheel is a **pinned, scroll-rotating 3D showcase**.
- **All ambient + 3D motion is disabled under `prefers-reduced-motion`.**

## Rules of thumb

1. Numbers count up; sections reveal on scroll; cards lift on hover.
2. Every async surface has loading (Skeleton) + empty (EmptyState) + error states.
3. Gradients and glow are accents, never the whole surface.
4. Animate transform/opacity/SVG path only (GPU-friendly). Mobile-first.
