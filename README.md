# 🌟 Planora — GenAI Celebration & Event Master Planner
> **[PromptWars Challenge 5: Celebration & Event Planner]**  
> *Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGautam-kumar01%2FPlanora&env=VITE_OPENROUTER_API_KEY)
[![Built with React 19 & TypeScript](https://img.shields.io/badge/Built%20with-React%2019%20%2B%20TypeScript-blue)](https://react.dev/)
[![Pure Vanilla CSS](https://img.shields.io/badge/Styling-Pure%20Vanilla%20CSS-orange)](#design-system--styling)
[![Inference Speed](https://img.shields.io/badge/AI%20Inference-1.6s%20Flash-success)](#performance)

Planora is an intelligent event copilot that fuses **deterministic financial mathematics** with **generative AI creativity**. Unlike generic chatbots that hallucinate numbers or break arithmetic formulas, Planora guarantees **zero budget error (Sum == 100%)**, automates host-to-vendor procurement briefs, protects outdoor ceremonies with an automated **Weather Plan B Contingency**, and provides a **Day-of Live Event Director Mode** for running celebrations in real time.

---

## 🚀 Key Killer Features (PromptWars Challenge 5)

### 1. 💰 Deterministic Financial Budget Engine
- **Sum == 100% Zero-Waste Guarantee:** AI only suggests category percentages; client-side TypeScript mathematics guarantees every penny accounts for the total ceiling.
- **Reactive Trade-Off Sliders:** Rebalance any category (e.g. increase Catering) and the 10% Emergency Contingency Reserve automatically absorbs the difference.
- **Real-Time Expense Ledger:** Track actual paid receipts against allocations with live over/under budget warnings.

### 2. ⚡ Day-Of "Live Event Director Mode" (Run-of-Show Conductor)
- **Live Ticking Clock & Completion Bar:** Tracks real-time schedule progress on celebration day.
- **Active Cue Spotlight:** Highlights which milestone is occurring right now, the responsible lead (MC, DJ, Chef), and location pin.
- **1-Click Cue Advancement:** Confetti particle burst and advance to next cue.
- **+15m Stage Buffer Delay:** Instantly adds stage breathing room if speeches or ceremonies run over.
- **Vendor Speed-Dial:** Instant telephone and radio links for booth, kitchen, and stage managers.

### 3. 🌧️ Weather "Plan B" Contingency & Rain Simulator
- **Meteorological Forecast Radar:** Simulate sunny conditions vs. 84% sudden rain storms or gale winds.
- **1-Click Rain Plan B:** Automatically shifts outdoor lawn ceremonies to covered indoor pavilions.
- **Contingency Reserve Draw:** Automatically funds marquee tent rentals and subflooring from the 10% emergency buffer without exceeding the master budget.
- **1-Click Broadcast Dispatch:** Copy pre-formatted emergency SMS/WhatsApp updates for guests and logistics alerts for vendors.

### 4. 🤝 1-Click Vendor RFP Briefs & Targeted Vetting
- **Instant Procurement Hand-off:** Automatically crafts formal vendor inquiries with scale, headcount, date, and allocated budget ceiling.
- **Targeted Interview Questions:** Equips hosts with 3 hard-hitting vetting questions (e.g., overtime penalty rates, generator backups, cancellation grace periods).
- **1-Click Actions:** Copy to clipboard, open in native mail client (`mailto:`), or print formal vendor briefs.

### 5. 🪑 Smart Seating Matrix & Allergen Guard
- **1-Click Auto-Seat by Affiliation:** Groups Family, VIP, Friends, and Colleagues onto tables within capacity limits.
- **Allergen Conflict Flags:** Prominently highlights nut, vegan, and gluten dietary clash warnings directly on table cards for catering safety.

### 6. 📱 100% Mobile-Friendly & Pure Vanilla CSS
- **Responsive Hamburger Drawer:** Seamless navigation sheet for smartphone viewports (iPhone, Android).
- **Horizontal Touch-Scroll Tabs:** Smooth swipeable module navigation (`-webkit-overflow-scrolling: touch`).
- **Warm Ivory & Terracotta Glassmorphism:** Curated color palette (`#FBF7F0`, Spiced Ochre, Golden Amber) with zero external CSS framework bloat.

### 7. ☁️ Option C Hybrid Cloud Persistence
- **Zero Friction Guest Mode:** Plan immediately with zero login (persisted in browser `localStorage`).
- **Cloud Database Synchronization:** Sign in or connect Supabase/PostgreSQL for multi-device cross-syncing.

---

## ⌨️ Pro Power-User Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> / <kbd>⌘</kbd> + <kbd>K</kbd> | Toggle AI Copilot Drawer |
| <kbd>Ctrl</kbd> + <kbd>N</kbd> / <kbd>⌘</kbd> + <kbd>N</kbd> | Launch 5-Step New Event Setup Wizard |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> / <kbd>⌘</kbd> + <kbd>P</kbd> | Generate Clean Master PDF / Print |
| <kbd>Esc</kbd> | Close any active modal dialog |

---

## 🛠️ Tech Stack

- **Frontend Core:** React 19, TypeScript, Vite
- **Icons & Animation:** Lucide-React, Canvas-Confetti
- **Styling:** Pure Vanilla CSS with CSS Custom Properties & Glassmorphism
- **AI Synthesis:** Google Gemini 2.5 Flash via OpenRouter API with AbortController timeout protection
- **Exports:** Native iCalendar (`.ics`) generation & CSS Print Engine

---

## 🌐 Deploy to Vercel in 2 Minutes

### Step 1: Import Repository
1. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your repository: `https://github.com/Gautam-kumar01/Planora`.
3. Vercel will automatically detect **Vite** as the framework.

### Step 2: Configure Environment Variables
In the Vercel project deployment screen under **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_OPENROUTER_API_KEY` | `sk-or-v1-...` | **(Required)** Your OpenRouter API key powering Gemini 2.5 Flash |
| `VITE_DATABASE_URL` | *(Optional)* | Supabase / PostgreSQL URL for Option C cloud synchronization |
| `VITE_SUPABASE_ANON_KEY` | *(Optional)* | Supabase anonymous public client key |

> **Note:** If no API key is provided in environment variables, Planora seamlessly falls back to local client-side deterministic synthesis or prompts the user via the in-app Key Modal.

### Step 3: Deploy
Click **Deploy**! Vercel will run `vite build` and provide your live production URL in under 60 seconds.

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/Gautam-kumar01/Planora.git
cd Planora

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and paste your VITE_OPENROUTER_API_KEY

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📄 License
MIT © 2026 Gautam Kumar. Built for PromptWars Challenge 5.
