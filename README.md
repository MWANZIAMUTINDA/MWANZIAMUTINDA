<img src="assets/animated/1-hero.svg" alt="Sylvester Mutinda: full-stack engineer at Wakandi Kenya, in Nairobi. Software for SACCOs, chamas, M-Pesa and credit." width="100%">

<p>
  <img src="assets/animated/2-building.svg" alt="What I build: CRB Lookup, shipped October 2026; M-Pesa SMS top-ups, live; support chatbot, live; SOKA, sprint 1; Mandai, in progress." width="49%">
  <img src="assets/animated/3-hobbies.svg" alt="Beyond code: football, streetwear and sneakers, and learning distributed systems and AI agents." width="49%">
</p>

I build software for the way money actually moves in Kenya: SACCOs, chamas and churches, M-Pesa, SMS, and the credit checks that come before a loan. IT graduate of the **Technical University of Kenya**, now at **Wakandi Kenya**.

<img src="assets/animated/4-tech-orbit.svg" alt="Tech stack. Frontend: TypeScript, React, Next.js, Tailwind. Backend: PHP, Laravel, Node.js, Python, Flask. Mobile and data: Kotlin, Android, PostgreSQL, Supabase, MySQL. Payments: M-Pesa Daraja, STK Push, Brevo, SMS. Delivery: Docker, Coolify, Vercel, Linux, GitHub." width="100%">

<img src="assets/animated/5-badge.svg" alt="Developer ID badge and a live dashboard of GitHub contributions, rebuilt every day." width="100%">

## Projects

| Project | What it does | Built with | Status |
| --- | --- | --- | --- |
| **CRB Lookup** · Wakandi | Credit-bureau checks for SACCOs, MFIs and chamas, with expiring results, an audit log and an API for loan products | Next.js, Supabase, PostgreSQL RLS | Shipped Oct 2026 |
| **M-Pesa SMS top-ups** · Wakandi | STK Push checkout per bundle, with payments recovered when the callback never comes | M-Pesa Daraja, Next.js, Supabase | Live |
| **Support chatbot** · Wakandi | Brevo chat that onboards new customers from a knowledge base | Brevo, TypeScript | Live |
| [**SOKA**](https://github.com/MWANZIAMUTINDA/soka-web) | Run your EA SPORTS FC friends' league | TypeScript, mobile, realtime | Sprint 1 |
| **Mandai** | Transparent car imports for Kenya | Next.js, TypeScript, payments | In progress |
| **Beijing FC** | Football club operations, with an Android app | Laravel, Kotlin, M-Pesa | Active |
| [**Kyeteni Pay**](https://github.com/MWANZIAMUTINDA/kyeteni-payment) | QR-code M-Pesa payments with receipts anyone can verify | Laravel, MySQL, Daraja | Live |
| [**SACCO Health Check**](https://github.com/MWANZIAMUTINDA/SACCO-Health-Check-Automated-Financial-Diagnostic) | A 46-point automated financial diagnostic | React, TypeScript, Tailwind | Demo |
| [**Nairobi Garbage Detection**](https://github.com/MWANZIAMUTINDA/nairobi_garbage_detection_system) | Report illegal dumping with a photo | Python, MobileNetV2, Flask | Open source |
| [**Muthurwa Smart Stalls**](https://github.com/MWANZIAMUTINDA/MUTHURWA_MARKET_SMART_STALL_BOOKING-SYSTEM) | Digital revenue collection for Muthurwa Market | Laravel, MariaDB, M-Pesa | Open source |

<img src="assets/animated/6-city.svg" alt="A night skyline built from my GitHub contributions over the last 12 months, one building per day, rebuilt daily." width="100%">

<details>
<summary><b>How I build M-Pesa payments</b></summary>

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

</details>

<img src="assets/animated/7-footer.svg" alt="Open to full-stack, fintech, payments and applied AI work." width="100%">

<p>
  <a href="https://github.com/MWANZIAMUTINDA"><img src="assets/animated/link-github.svg" alt="Follow me on GitHub" width="32%"></a>
  <a href="https://github.com/MWANZIAMUTINDA?tab=repositories"><img src="assets/animated/link-repos.svg" alt="Browse my repositories" width="32%"></a>
  <a href="https://github.com/MWANZIAMUTINDA/soka-web"><img src="assets/animated/link-soka.svg" alt="SOKA: run your EA SPORTS FC league" width="32%"></a>
</p>
