<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/cards/header-dark.svg">
  <img src="assets/cards/header-light.svg" alt="Sylvester Mutinda. Full-stack engineer at Wakandi Kenya, in Nairobi: software for SACCOs, chamas, M-Pesa and credit." width="100%">
</picture>

Full-stack engineer at **Wakandi Kenya**, in Nairobi. I build software for the way money actually moves in Kenya: SACCOs, chamas and churches, M-Pesa, SMS, and the credit checks that come before a loan.

Next.js · Supabase · Laravel · Kotlin · PostgreSQL

## About me

I'm an IT graduate of the **Technical University of Kenya**. I work across the whole stack, from database schema and row-level security to the screens people use on a phone, and I ship with tests: the Jamii platform I work on runs more than 2,000 of them on every change.

## What I'm working on now

October 2026

- **CRB Lookup at Wakandi.** "Check before you lend" for SACCOs, MFIs and chamas: credit checks inside a loan application, results that expire, a full audit log, and an API that loan products call with keys.
- **M-Pesa top-ups for Jamii Connect.** STK Push per bundle, confirming the number before the prompt, and recovering payments whose callback never arrived.
- **Support chatbot and knowledge base.** A Brevo chat that onboards new customers, answering from a knowledge base written against the live app.

## Featured work

### At Wakandi Kenya, on the Jamii platform

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/wakandi-crb-dark.svg">
    <img src="assets/cards/wakandi-crb-light.svg" alt="CRB Lookup: credit-bureau checks for SACCOs, MFIs and chamas. Shipped October 2026." width="100%">
  </picture>
</p>
<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/wakandi-payments-dark.svg">
    <img src="assets/cards/wakandi-payments-light.svg" alt="M-Pesa SMS top-ups: STK Push checkout and payment recovery. Live." width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/wakandi-chatbot-dark.svg">
    <img src="assets/cards/wakandi-chatbot-light.svg" alt="Chatbot and knowledge base: Brevo chat onboarding. Live." width="49%">
  </picture>
</p>

### Personal and client projects

<p>
  <a href="https://github.com/MWANZIAMUTINDA/soka-web"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/soka-dark.svg">
    <img src="assets/cards/soka-light.svg" alt="SOKA: run your EA SPORTS FC friends' league. Sprint 1, November 2026." width="49%">
  </picture></a>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/mandai-dark.svg">
    <img src="assets/cards/mandai-light.svg" alt="Mandai: transparent car imports for Kenya. In progress." width="49%">
  </picture>
</p>
<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/beijing-fc-dark.svg">
    <img src="assets/cards/beijing-fc-light.svg" alt="Beijing FC: football club operations app. Active." width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/fundi-dark.svg">
    <img src="assets/cards/fundi-light.svg" alt="Kenyan Fundi Marketplace: verified tradespeople near you. In progress." width="49%">
  </picture>
</p>
<p>
  <a href="https://github.com/MWANZIAMUTINDA/kyeteni-payment"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/kyeteni-dark.svg">
    <img src="assets/cards/kyeteni-light.svg" alt="Kyeteni Pay: QR-code M-Pesa payments with verifiable receipts. Live." width="49%">
  </picture></a>
  <a href="https://github.com/MWANZIAMUTINDA/SACCO-Health-Check-Automated-Financial-Diagnostic"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/sacco-health-dark.svg">
    <img src="assets/cards/sacco-health-light.svg" alt="SACCO Health Check: a 46-point automated diagnostic. Demo." width="49%">
  </picture></a>
</p>
<p>
  <a href="https://github.com/MWANZIAMUTINDA/nairobi_garbage_detection_system"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/garbage-dark.svg">
    <img src="assets/cards/garbage-light.svg" alt="Nairobi Garbage Detection: report illegal dumping with a photo. Open source." width="49%">
  </picture></a>
  <a href="https://github.com/MWANZIAMUTINDA/MUTHURWA_MARKET_SMART_STALL_BOOKING-SYSTEM"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/muthurwa-dark.svg">
    <img src="assets/cards/muthurwa-light.svg" alt="Muthurwa Smart Stalls: digital revenue collection for Muthurwa Market. Open source." width="49%">
  </picture></a>
</p>

## How I build M-Pesa payments

A payment isn't done when the STK Push is sent. It's done when the money is matched to the right record, even if Safaricom's callback never comes.

```mermaid
flowchart LR
    A["Customer picks a bundle<br/>and confirms the number"] --> B["Pending payment<br/>recorded"]
    B --> C["STK Push sent<br/>to M-Pesa"]
    C --> D["Customer<br/>enters PIN"]
    D --> E{"Callback<br/>arrived?"}
    E -- "Yes" --> F["Check the amount,<br/>mark paid, add credit once"]
    E -- "No" --> G["STK status query"]
    G --> F
    F --> H["Receipt with a<br/>masked reference"]

    classDef done stroke:#2da44e,stroke-width:2px
    class F,H done
```

## My year in numbers

**Contributions per month in 2026.** Most of my work is in private company repos, so the public graph shows less than this.

```mermaid
%%{init: {'themeVariables': {'xyChart': {'plotColorPalette': '#2da44e'}}}}%%
xychart-beta
    title "GitHub contributions, 2026"
    x-axis [Mar, Apr, May, Jun, Jul, Aug, Sep, Oct]
    y-axis "Contributions" 0 --> 300
    bar [9, 0, 0, 7, 43, 72, 150, 273]
```

Where my Jamii commits went from September to October 2026: CRB Lookup 19, M-Pesa payments 13, chatbot and knowledge base 11, onboarding and referrals 5.

| 2026 | What happened |
| --- | --- |
| March | Smart stall booking, first version |
| June | Muthurwa Market smart stalls, Skill Connect |
| July | Football ball tracking with computer vision |
| August | Joined Wakandi Kenya; Kyeteni Pay with QR M-Pesa receipts |
| September | SACCO Health Check, Nairobi garbage detection, Jamii M-Pesa top-ups and chatbot |
| October | CRB Lookup shipped, Beijing FC Android app, Mandai, SOKA planned |

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/stats-dark.svg">
    <img src="assets/cards/stats-light.svg" alt="557 contributions in the last 12 months, 48 pull requests (46 merged), 21 repositories (7 private), 62 active days since March 2026, best day 43 on 9 October 2026." width="100%">
  </picture>
</p>
<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/languages-dark.svg">
    <img src="assets/cards/languages-light.svg" alt="Languages: Blade 27.7%, TypeScript 24.8%, PHP 19.4%, Kotlin 14.8%, Python 5.0%, PL/pgSQL 4.2%, CSS and JS 2.1%, HTML 1.9%." width="49%">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/cards/weekdays-dark.svg">
    <img src="assets/cards/weekdays-light.svg" alt="Contributions by weekday: Monday 118, Tuesday 152, Wednesday 93, Thursday 59, Friday 121, Saturday 7, Sunday 7." width="49%">
  </picture>
</p>

## Tech stack

| Area | Tools |
| --- | --- |
| Frontend | TypeScript, JavaScript, React, Next.js, Tailwind CSS |
| Backend | Node.js, PHP and Laravel, Python and Flask |
| Mobile, data and AI | Kotlin and Android, PostgreSQL, Supabase, MySQL, OpenCV |
| Payments and messaging | M-Pesa Daraja, Brevo, SMS |
| Delivery | Docker, Coolify, Vercel, Git and GitHub, Linux |
| Working with | Figma, VS Code, Claude Code |

## How I work

| Step | What it means |
| --- | --- |
| **Understand** | Learn the domain first: how a SACCO lends, how a church collects giving, how a chama tracks contributions. |
| **Read before writing** | Check the existing code, data and patterns before adding anything new. |
| **Small, tested steps** | Small pull requests, each one with tests, and row-level security checked in the database itself. |
| **Ship and watch** | Deploy with Docker and Coolify, then check it works for real users. |

## Beyond code

- **Football.** I play, follow the tactics, and build tools for my club.
- **Streetwear and sneakers.** Jordans and caps.
- **Learning.** Distributed systems and AI agents.

## Work with me

I'm open to full-stack, fintech and payments work, and applied AI projects. The fastest way to reach me is a message here on GitHub.
