# PayShield AI — implementation plan

## Product
PayShield AI is a hackathon-ready payment traffic manager that makes the cost of false declines visible: a rigid legacy checkout blocks a legitimate third retry, while an AI-enabled path reads session telemetry, rescues human intent through PayPal Express, and blocks automated abuse.

## Implementation
- React/Vite frontend in `client/src` with a responsive split-screen comparison, live metrics, telemetry-aware buttons, JSON decision feed, and PayPal order result panel.
- Express backend in `server/_core/index.ts` with `/api/health`, `/api/decision`, and `/api/paypal/order` endpoints. Gemini is called server-side with structured JSON instructions; PayPal OAuth and Orders v2 are called server-side with protected environment values.
- The UI sends intentionally different telemetry profiles: consistent cart / normal timing / same device for a buyer retry, and randomized rapid payloads for bot activity. Legacy simulation remains deterministic and local to the comparison panel.
- The PayPal order request is for one `Pro Mechanical Keyboard` item at USD 199.00, with an approval link returned to the browser but no secret or access token exposed.
- Runtime uses the existing server-enabled web starter and port 3000. No database is needed for this interactive demo.

## Design
Three possible directions sampled from the tails: Editorial payment console (0.07), Soft corporate dashboard (0.06), Transactional instrument panel (0.08). Chosen: **Transactional instrument panel**.

- **Design movement:** contemporary payments infrastructure UI: quiet precision, white surfaces, graphite type, cobalt interaction accents, and thin rules that feel operational rather than decorative.
- **Core principles:** evidence over hype; one clear action per state; comparison is visual and immediate; motion confirms system state without distracting from it.
- **Color philosophy:** PayPal-adjacent cobalt and deep navy signal trust; warm paper-white keeps the interface approachable; muted amber flags attention and restrained red communicates a real block. No neon gradients.
- **Layout paradigm:** a narrow operational header feeds into a two-column comparison rail, with the log anchored below as an audit trail rather than a generic dashboard grid.
- **Signature elements:** a small shield wordmark, state badges with live dots, and monospace JSON excerpts that make the reasoning inspectable.
- **Interaction philosophy:** every click produces an observable change: button feedback, metric movement, log event, and outcome card. Loading states are calm and short; results settle into place.
- **Animation:** 180–260ms ease-out transitions, subtle panel lift on hover, number transitions, log rows entering with a short rise/fade, and no looping decorative motion.
- **Typography system:** Inter for interface text; IBM Plex Mono for telemetry, order IDs, JSON, and metrics. Strong hierarchy comes from weight and spacing, not oversized slogans.
- **Brand essence:** Payment traffic control that protects conversion without opening the door to abuse. Precise, calm, accountable.
- **Brand voice:** direct and operational. Example lines: “A third retry is not a verdict.” and “Route human intent forward; stop automation at the edge.”
- **Wordmark & logo:** a compact shield outline with an interior forward arrow, paired with the PayShield AI wordmark.
- **Signature brand color:** PayShield cobalt `#0B63CE`, used as a focused action color rather than a full-screen wash.

## Project structure
- `client/src/pages/Home.tsx`: application shell and interaction state.
- `client/src/index.css`: visual system, responsive layout, motion, and component styling.
- `server/_core/index.ts`: Express routes and third-party API integration.
- `public/manus-routes.json`: page route manifest for `/` and `/404`.
- `Dockerfile` / `package.json`: server build and production runtime.
