# vincenzo.dev — Shopify Frontend Developer Landing

Personal landing page. Dark theme with Shopify-green accents, inspired by
[evolvion.io](https://www.evolvion.io/)'s structure (floating pill nav, gradient
hero, marquee, bento cards, FAQ).

## Zero frameworks, zero build step

The page itself is the portfolio piece — it uses the modern web platform directly:

- CSS **scroll-driven animations** (`animation-timeline: view()` / `scroll()`) with an IntersectionObserver fallback
- **Container queries** on the bento cards
- **`@property`** registered custom property for animated gradient angles
- Native **CSS nesting**, **`:has()`** (mobile menu state), `color-mix()`, `text-wrap: balance`
- Native `<details name>` exclusive accordion for the FAQ
- `backdrop-filter` glass nav, `prefers-reduced-motion` support
- `antigravity.js` — vanilla Canvas 2D port of react-bits' `<Antigravity />` hero
  background (same particle math, no three.js/react dependency); configured in
  `script.js`, disabled for reduced-motion users

## Run

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Customize

All copy marked with `[Placeholder — …]` is meant to be replaced. Swap the
portrait placeholder in the "Who am I" section with a real photo.
