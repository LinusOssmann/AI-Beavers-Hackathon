# TripMatch

**AI-powered travel app that helps you discover and plan trips that actually fit you.**

Answer a few quick questions about your style, budget, and mood—TripMatch suggests personalized destinations and builds trip plans with locations, accommodations, activities, and transport. The app is mobile-first, works as a PWA, and uses Manus AI for research and recommendations.

---

## What TripMatch Does

- **Onboarding** – New users complete a short flow: travel style, budget, trip length, companion, and departure location. Preferences are saved and used to personalize suggestions.
- **Personalized trip suggestions** – A feed of trip ideas (e.g. coastal getaways, hiking, culture, adventure) filtered by your preferences.
- **Trip plans** – Create plans with dates and descriptions. For each plan you can get:
  - **Destinations** – AI-suggested locations (cities/regions) via Manus with optional MCP tools.
  - **Accommodations, activities, transport** – Per-destination suggestions stored in a structured way so you can view and select options.
- **Dashboard** – View your travel preferences and existing plans; sign in/out and manage account.
- **PWA** – Installable app with a custom install prompt, service worker, and optional web push notifications (VAPID).
- **Auth** – Email/password sign-up and sign-in with [Better Auth](https://www.better-auth.com/), session-based and cookie-backed.

---

## Tech Stack

| Layer         | Technology                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router)                                                                           |
| **UI**        | [React 19](https://react.dev/), [Shadcn UI](https://ui.shadcn.com/) / Radix UI, [Tailwind CSS](https://tailwindcss.com/) |
| **Language**  | [TypeScript](https://www.typescriptlang.org/)                                                                            |
| **Database**  | [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)                                      |
| **Auth**      | [Better Auth](https://www.better-auth.com/) (email/password, Next.js cookies)                                            |
| **AI**        | OpenAI-compatible API ([Manus](https://manus.im/) by default) for location research and suggestions                      |
| **PWA**       | Next.js manifest, service worker registration, [web-push](https://github.com/web-push-libs/web-push) for notifications   |
| **Analytics** | [Vercel Analytics](https://vercel.com/analytics)                                                                         |
| **Testing**   | [Playwright](https://playwright.dev/) (E2E), run on push/PR to `main`/`master`                                           |

Additional libraries include: `zod`, `react-hook-form`, `@hookform/resolvers`, `date-fns`, `lucide-react`, `sonner`, `recharts`, `next-themes`, and others—see `package.json`.

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                 # API routes (auth, plans, users)
│   ├── dashboard/          # Dashboard page (plans, preferences)
│   ├── sign-in|sign-up/     # Auth pages
│   ├── location-suggester/ # Manus: suggest destinations for a plan
│   ├── location-researcher/
│   ├── preference-refiner/
│   ├── actions.ts          # Server actions (preferences, push, etc.)
│   ├── layout.tsx
│   ├── page.tsx            # Landing (TripMatch hero + CTA)
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── auth/               # Sign-in/up forms, auth dialog
│   ├── dashboard/          # Dashboard + dashboard content
│   ├── feed/               # Suggestions feed, trip cards, trip detail, filters
│   ├── onboarding/         # Multi-step onboarding + screens
│   ├── pwa/                # Install prompt, service worker registration
│   └── ui/                 # Shadcn UI primitives
├── lib/
│   ├── auth.ts             # Better Auth config
│   ├── auth-client.ts
│   ├── ai.ts               # OpenAI-compatible / Manus client
│   ├── manus-responses.ts  # Manus task/response handling
│   ├── prompts.manus.service.ts
│   ├── schemas.manus.service.ts
│   ├── mcp-travel-store.ts # MCP travel store (activities, accommodations, etc.)
│   └── services/           # accommodation, activity, location, transport, user
├── prisma/
│   ├── schema.prisma      # Star schema: Plan → Location → Accommodation / Activity / Transport
│   └── migrations/
├── docs/                   # e.g. ngrok-mcp.md
├── scripts/                # DB and Manus test scripts
└── tests/                  # Playwright E2E
```

---

## Data Model (Prisma)

- **User** – id, name, email, preferences (JSON), onboardingComplete, sessions, accounts, plans.
- **Plan** – userId, title, description, startDate, endDate; has many **Location**s.
- **Location** – planId, name, city, country, lat/long, reason, isSelected; has many Accommodation, Activity, Transport.
- **Accommodation / Activity / Transport** – locationId, name, type, price, rating, reason, isSelected, etc.

One selected location per plan and one selected accommodation/activity/transport per location are enforced via partial unique indexes (see comments in `prisma/schema.prisma`).

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- PostgreSQL
- (Optional) Manus API key and connector ID for full AI features

### 1. Clone and install

```bash
git clone <repo-url>
cd AI-Beavers-Hackathon
npm install
```

### 2. Environment variables

Copy the example env and fill in values:

```bash
cp .env.example .env
```

Important variables:

- **Auth:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (e.g. `http://localhost:3000`)
- **Database:** `DATABASE_URL`, `SHADOW_DATABASE_URL` (for migrations)
- **AI/Manus:** `AI_OPENAI_COMPATIBLE_BASE_URL`, `AI_OPENAI_COMPATIBLE_API_KEY`, and optionally `MANUS_API_KEY`, `MANUS_TRAVEL_CONNECTOR_ID`
- **PWA push:** `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- **MCP:** `MCP_API_KEY` (if using MCP from external clients)

See `.env.example` and project docs for details.

### 3. Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

Optional: `npm run test:db` to verify the DB connection.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, complete onboarding, then use the dashboard and trip suggestions.

---

## Scripts

| Script                         | Description                       |
| ------------------------------ | --------------------------------- |
| `npm run dev`                  | Start Next.js dev server          |
| `npm run build`                | Production build                  |
| `npm run start`                | Start production server           |
| `npm run lint`                 | Run ESLint                        |
| `npm run prisma:generate`      | Generate Prisma Client            |
| `npm run prisma:migrate`       | Run Prisma migrations (dev)       |
| `npm run prisma:migrate:debug` | Migrate with logging script       |
| `npm run test:db`              | Test Prisma/DB connection         |
| `npm run clean`                | Remove `.next` and `node_modules` |

---

## PWA and Push Notifications

- **Manifest:** `app/manifest.ts` defines name, icons, display, and categories.
- **Service worker:** Registered via `components/pwa/service-worker-register.tsx`.
- **Install prompt:** `components/pwa/install-prompt.tsx` for “Add to Home Screen”.
- **Push:** VAPID keys in `.env`; subscribe/send in `app/actions.ts`. See `PWA_SETUP.md` and `PWA_TROUBLESHOOTING.md` for setup and debugging.

---

## AI and Manus

- **Client:** `lib/ai.ts` uses an OpenAI-compatible provider (e.g. Manus) via `AI_OPENAI_COMPATIBLE_*` or Manus-specific keys.
- **Flows:** Location suggestions (`location-suggester`), research, and preference refinement call Manus; prompts live in `lib/prompts.manus.service.ts`.
- **MCP:** The app can integrate with Manus MCP tools for destinations, accommodations, activities, and transport; `lib/mcp-travel-store.ts` and services in `lib/services/` align with that model.

---

## Testing

- **E2E:** Playwright; run with `npx playwright test`. CI runs Playwright on push/PR to `main`/`master` (see `.github/workflows/playwright.yml`).

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth](https://www.better-auth.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Manus](https://manus.im/) (AI / MCP)
