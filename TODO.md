# PayShield AI delivery outcomes

## Secure third-party decision and payment path
- The backend uses Google Gemini to analyze checkout telemetry and returns JSON with `decision` restricted to `RESCUE_PAYPAL` or `BLOCK_BOT`, a numeric `confidence`, and a `reason`.
- When the AI decision is `RESCUE_PAYPAL`, the backend calls the PayPal Sandbox Orders v2 REST API for a real USD 199.00 order and returns the PayPal Order ID and approval link to the UI.
- Gemini and PayPal credentials remain server-side protected environment values and are never bundled into frontend code.

## Split-screen checkout comparison
- The left panel is titled `Legacy Checkout - No AI`, shows `Pro Mechanical Keyboard - $199.00`, and has `Simulate Buyer Retry (3rd Attempt)`.
- The legacy simulation always shows a red `403 Fraud Block: Too Many Retries` state and increments a `Lost Revenue` counter.
- The right panel is titled `PayShield AI Enabled`, shows the same product, and has buyer-retry and bot-attack simulations.
- The buyer retry sends consistent-cart, normal-click-timing, same-device telemetry to the backend.
- The bot simulation sends 10 rapid requests with high-speed randomized payloads.

## Live observability and finish
- The top metrics bar shows live `Revenue Rescued ($)`, `False Declines Prevented`, and `Bot Attacks Blocked` counters.
- The AI Decision Log shows backend JSON reasoning, confidence, and human-readable routing outcomes.
- The application uses smooth, restrained fintech styling with responsive behavior and no neon or generic AI-slop visual treatment.
- The published app has a healthy `/api/health` response and a synchronized `/manus-routes.json` manifest.
