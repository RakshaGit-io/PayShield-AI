# PayShield AI
### Don't block the buyer. Block the bot.

Ever stood in a HUGE queue just to get your morning coffee?

You've finally reached the counter, opened your payment app, made a tiny mistake, retried a couple of times, and suddenly...

**TRANSACTION BLOCKED.**

Apparently, you're a suspicious bot trying to breach the payment system. But all you wanted was a coffee.

Well, that happened to us. And it got us thinking: How many genuine customers face the same frustration? How many businesses lose perfectly good sales because their payment systems fail to distinguish genuine payment retries from malicious bot activity?

That's what inspired us to build **PayShield AI — your smarter payment security partner.**

## What is PayShield AI?

PayShield AI is an AI-assisted payment security layer designed to distinguish genuine customers from suspicious automated traffic.

Instead of relying solely on payment retry limits, it analyses behavioural and session-based signals such as:

- Cart and transaction consistency.
- Device and session behaviour.
- Time intervals between payment attempts.
- Request frequency and interaction patterns.
- Unusual bursts of automated activity.

Our goal is simple: Prevent fraud without unnecessarily blocking genuine customers.

## How It Works

We built a split-screen checkout experience to demonstrate the difference.

**Traditional Payment System**
- Repeated payment attempts.
- Retry limit reached.
- Customer gets blocked.
- Potential sale lost.

**PayShield AI**
- Analyses customer behaviour and session context.
- Evaluates suspicious activity using a risk score.
- Identifies potentially legitimate payment retries.
- Redirects eligible customers to a PayPal Sandbox fallback checkout.
- Detects and blocks suspicious automated traffic.

We also implemented a simulated bot attack to demonstrate how rapid and unusual requests can be identified.

## What Makes It Different?

PayShield AI focuses on understanding behaviour rather than simply counting retries.

**Genuine customers** generally maintain consistent cart details, devices, sessions and natural interaction patterns.

**Suspicious bots** may exhibit unusually rapid requests, inconsistent session signals, changing payloads and large bursts of automated activity.

By evaluating these signals together, PayShield AI aims to make smarter payment security decisions.

## Challenges We Faced

One of our biggest challenges was distinguishing genuine customers repeatedly attempting payments from bots deliberately flooding a payment system.

Initially, retry counts seemed like an obvious solution. However, we realised that repeated attempts don't necessarily indicate fraud. Context matters.

Integrating AI-assisted decision-making, the checkout experience and PayPal Sandbox into one cohesive prototype was another interesting challenge.

## What We're Proud Of

- Turning an everyday frustration into a practical innovation.
- Building a working split-screen checkout demonstration.
- Exploring AI beyond traditional chatbot applications.
- Integrating payment workflows with PayPal Sandbox.
- Exploring the balance between fraud prevention and customer experience.

## What We Learned

This project introduced us to behavioural analysis, payment workflows, fraud detection, AI-assisted decision-making and API integration.

Our biggest takeaway?

**Making a system smarter doesn't always mean making it stricter. Sometimes, it means teaching it when NOT to say no.**

## What's Next?

We envision taking PayShield AI further through:

- Improved AI-based risk assessment.
- Real-world payment gateway integration.
- More advanced behavioural fraud detection.
- Real-time transaction and risk analytics.
- Scalability across different businesses and payment environments.

## Our Vision

We believe businesses shouldn't have to sacrifice customer experience for payment security.

We want genuine customers to complete their purchases, businesses to retain their revenue, and bots to stay away from the checkout.

**More genuine clicks. Fewer false declines. More KA-CHING!**
