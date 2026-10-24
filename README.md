# 🌟 Planora — GenAI Celebration & Event Master Planner

> **[PromptWars Challenge 5: Celebration & Event Planner]**  
> *A state-of-the-art GenAI planning copilot that unites deterministic financial mathematics, multi-day ceremony timelines, vendor procurement CRM, intelligent seating, and emergency contingency protocols.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGautam-kumar01%2FPlanora&env=VITE_OPENROUTER_API_KEY)
[![Built with React 19 & TypeScript](https://img.shields.io/badge/Built%20with-React%2019%20%2B%20TypeScript-blue?style=flat-square&logo=react)](https://react.dev/)
[![Pure Vanilla CSS](https://img.shields.io/badge/Styling-Pure%20Vanilla%20CSS-orange?style=flat-square)](#design-system--styling)
[![AI Inference](https://img.shields.io/badge/AI%20Inference-Google%20Gemini%202.5%20Flash-purple?style=flat-square&logo=google)](https://openrouter.ai/)
[![Multi-Currency](https://img.shields.io/badge/Currency-INR%20₹%20%7C%20USD%20$%20%7C%20EUR%20€%20%7C%20GBP%20£-amber?style=flat-square)](#deterministic-financial-engine)

---

## 📖 Table of Contents
1. [Overview & Philosophy](#-overview--philosophy)
2. [Key Core Modules & Innovations](#-key-core-modules--innovations)
3. [Architecture & Data Isolation Flow](#-architecture--data-isolation-flow)
4. [Pro Power-User Shortcuts](#-pro-power-user-shortcuts)
5. [Automated Test Suite (43 Tests)](#-automated-test-suite-43-tests)
6. [Tech Stack](#-tech-stack)


---

## 🎯 Overview & Philosophy

Most generative AI event tools act as glorified text chatbots that hallucinate financial figures, output schedules with timing clashes, and collapse when budgets change.

**Planora is engineered on a strict dual-layer paradigm:**
1. **Deterministic Core:** Exact arithmetic formulas, zero-error budget balance (`Sum == 100%`), date constraints, allergen matrixes, and conflict auditing run purely via TypeScript client-side algorithms.
2. **Generative Creativity Layer:** Google Gemini 2.5 Flash acts as a creative advisory partner for personalized design themes, custom ceremony rituals, vendor vetting questions, speechwriting, and situational risk adjustments.

---

## 🚀 Key Core Modules & Innovations

### 1. 💰 Deterministic Financial Budget Engine
- **Sum == 100% Zero-Leak Guarantee:** AI only suggests initial allocation percentages; deterministic TypeScript mathematics allocates every single penny.
- **Dynamic Multi-Currency:** Native support for Indian Rupees (`₹ INR` with Lakhs / Crores notation), US Dollars (`$ USD`), Euros (`€ EUR`), and British Pounds (`£ GBP`).
- **Reactive Trade-Off Sliders:** Increasing one category (e.g., Catering or Photography) automatically rebalances the remaining categories and the 10% Emergency Contingency buffer without exceeding the master ceiling.
- **Expense & Receipt Ledger:** Log verified payments and track variance across all vendor categories in real time.

### 2. 🪔 Indian Wedding & Multi-Day Celebration Intelligence
- **Comprehensive Ritual Engine:** Pre-configured and customizable sub-event schedules for **Haldi**, **Mehendi**, **Sangeet**, **Baraat & Shaadi / Pheras**, and **Reception**.
- **Regional Catering & Dietary Profiling:** Automated per-guest cost modeling for Pure Vegetarian, Jain (no root vegetables), and Non-Vegetarian spreads with live buffet counter multipliers.
- **Statutory Municipal Permits & NOC Checklist:** Dedicated compliance tracker for Sound/Loudspeaker permits, Fire NOC, Liquor license, and Police clearances.

### 3. 🤝 Vendor CRM, RFPs & Procurement Pipeline
- **Procurement Stage Pipeline:** Real-time tracking from `To Research` → `Contacted` → `Quote Received` → `Booked & Confirmed`.
- **1-Click Communication Shortcuts:** Direct **Call (`tel:`)**, **WhatsApp Chat (`wa.me`)**, and **Email (`mailto:`)** action shortcuts for every vendor partner.
- **Automated AI Vendor RFP Briefs:** 1-click exportable inquiry briefs customized with event date, guest count, scale, and allocated budget ceiling.
- **Deposit & Retainer Due Date Alerts:** Smart alert badges flag upcoming and overdue contract milestone payments.
- **Neutral Quote Comparison Matrix:** Compare up to 4 vendor quotes across deliverables, deposit terms, and pricing.

### 4. ⚡ Day-Of "Live Event Director Mode" (Run-of-Show Conductor)
- **Real-Time Ticking Conductor:** Tracks live schedule progress on the day of celebration.
- **Active Cue Spotlight:** Highlights which milestone is occurring right now, the responsible lead (MC, DJ, Coordinator), and location pin.
- **+15m Stage Buffer Delay:** Instantly recalculates remaining timeline if speeches or ceremonies run over schedule.
- **1-Click Cue Advancement:** Confetti burst on reaching milestones.

### 5. 🌧️ Weather "Plan B" Contingency & Rain Simulator
- **Meteorological Radar Simulator:** Simulate sunny conditions vs. 84% sudden rainstorms or high winds.
- **1-Click Rain Plan B:** Automatically shifts outdoor ceremonies to covered indoor pavilions.
- **Contingency Reserve Draw:** Funds marquee tent rentals and flooring from the 10% emergency buffer without breaking the master budget.
- **Emergency Broadcast Dispatch:** Pre-formatted emergency SMS/WhatsApp updates for guests and logistics alerts for vendors.

### 6. 🪑 Smart Seating Matrix & Allergen Guard
- **Auto-Seat by Affiliation:** Groups Family, VIP, Friends, and Colleagues onto tables within seating capacity limits.
- **Allergen Clash Flags:** Highlights nut, gluten, dairy, and vegan dietary conflict warnings directly on table cards for catering safety.

### 7. 🔒 Strict Multi-User Isolation & Privacy Protection
- **Per-User Scoped Storage:** Each logged-in user only ever sees and accesses their own created event plans (`planora_plans_user_${userId}`).
- **Zero Cross-User Data Leakage:** Unauthorized direct access attempts trigger immediate access denial.
- **Homepage Template Confinement:** Pre-built sample plans (Wedding, Birthday, Community) are strictly confined to the homepage demo showcase and never appear in a user's private dashboard.
- **Clean Empty States:** New registered users receive a clean empty dashboard inviting them to create their first plan.

---

## 🏗️ Architecture & Data Isolation Flow

```mermaid
flowchart TD
    subgraph UI ["Planora Frontend (React 19 + TypeScript + Vanilla CSS)"]
        Nav[Navbar & View Switcher]
        Home[Homepage Showcase & Demo Plans]
        UserDash[User Dashboard (Isolated per User)]
        Workspace[Master Event Workspace]
    end

    subgraph Auth ["Authentication & Session Layer"]
        GuestMode["Guest Mode (LocalStorage Guest Namespace)"]
        UserSession["Authenticated Session (User ID Scoped)"]
    end

    subgraph Storage ["Strict Ownership & Storage Layer"]
        StorageCheck{"canUserAccessPlan(plan, userId)"}
        GuestStorage[Guest Plans Storage]
        UserStorage["User Scoped Storage (planora_plans_user_{id})"]
        AccessDenied["Access Denied Toast"]
    end

    subgraph Engines ["Deterministic Computation Engines"]
        BudgetEngine[Deterministic Budget Math (Sum == 100%)]
        IndianEngine[Indian Wedding Multi-Day Rituals]
        VendorEngine[Vendor Pipeline & Retainer Alerts]
        ConflictEngine[Timeline Conflict & Clashing Auditor]
        WeatherEngine[Weather Plan B Contingency]
    end

    Nav --> Home
    Nav --> UserDash
    Nav --> Workspace

    Home -->|Explore Templates| GuestMode
    UserDash -->|Strict Filter| UserSession

    UserSession --> StorageCheck
    GuestMode --> StorageCheck

    StorageCheck -->|Authorized| UserStorage
    StorageCheck -->|Guest| GuestStorage
    StorageCheck -->|Unauthorized| AccessDenied

    Workspace --> BudgetEngine
    Workspace --> IndianEngine
    Workspace --> VendorEngine
    Workspace --> ConflictEngine
    Workspace --> WeatherEngine
```

---

## ⌨️ Pro Power-User Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> | Toggle AI Copilot Drawer | Instant access to the Gemini celebration assistant |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> / <kbd>⌘</kbd> + <kbd>N</kbd> | Launch Setup Wizard | Start a new wedding, birthday, or community plan |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> / <kbd>⌘</kbd> + <kbd>P</kbd> | Print Master Dossier | Generates clean, printer-friendly PDF dossier |
| <kbd>Esc</kbd> | Close Active Modal | Dismisses any open dialog or overlay |

---


### Key Test Coverages:
1. **Plan Ownership & User Isolation:** Guarantees User A cannot access User B's plans, verifies complete isolation, and ensures pre-built presets never leak into user dashboards.
2. **Deterministic Arithmetic:** Verifies `Sum == 100%` across budgets from $5,000 to $100,000 and ₹5 Lakhs to ₹1 Crore.
3. **Timeline Clashes & Auditing:** Tests chronological consistency, overlapping milestones, and stage buffers.
4. **Indian Wedding Engine:** Validates Haldi/Mehendi date offsets, Pure Veg/Jain catering ratios, and permit checklist rules.
5. **Vendor Quote Neutrality:** Verifies price ranking algorithms and budget variance calculations.

---

## 🛠️ Tech Stack

- **Core Framework:** React 19, TypeScript, Vite
- **Styling Architecture:** Pure Vanilla CSS with CSS Variables, Responsive Fluid Typography & Glassmorphism
- **Icons & Delight:** Lucide-React, Canvas-Confetti
- **AI Synthesis:** Google Gemini 2.5 Flash via OpenRouter with client-side fallback
- **Date & Calendar:** Native iCalendar (`.ics`) generation & ISO 8601 timeline math


---

## 💻 Getting Started & Local Setup

```bash
# 1. Clone repository
git clone https://github.com/Gautam-kumar01/Planora.git
cd Planora

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run test suite
npm test

# 5. Build for production
npm run build
```

---


## 📄 License
MIT © 2026 Gautam Kumar. Built for PromptWars Challenge 5: Celebration & Event Planner.
