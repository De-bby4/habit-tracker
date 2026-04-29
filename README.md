# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js (App Router), React, TypeScript, and Tailwind CSS. All data persists locally in `localStorage`. The app installs as a PWA and renders its cached shell offline after the first visit.

## Project Overview

Users can sign up, log in, create habits, edit them, delete them with explicit confirmation, mark them complete for today, see a current streak, and log out. Sessions and habits survive page reloads. The implementation follows the Stage 3 technical requirements document section by section — see [Requirements Mapping](#requirements-mapping) below.

**Live demo:** https://habit-tracker-hmzq.vercel.app

## Setup

```bash
npm install
```

Node.js 18+ is recommended.

## Running the App

```bash
npm run dev       # development server at http://localhost:3000
npm run build     # production build
npm run start     # production server (after build)
```

## Running Tests

```bash
npm run test:unit          # Vitest unit tests with coverage
npm run test:integration   # Vitest integration/component tests
npm run test:e2e           # Playwright end-to-end tests
npm run test               # all of the above, in order
```

Playwright will start its own dev server if one isn't already running. Install browsers the first time with:

```bash
npx playwright install chromium
```

The service-worker offline test occasionally needs a second run on the very first cold start while the worker registers — this is a Playwright timing quirk, not an app bug.

## Local Persistence Structure

All data is stored in `localStorage` using exactly three keys:

| Key | Shape | Description |
|-----|-------|-------------|
| `habit-tracker-users` | `User[]` | All registered users |
| `habit-tracker-session` | `Session \| null` | Active session, or absent when logged out |
| `habit-tracker-habits` | `Habit[]` | All habits across all users |

The dashboard filters habits by the active session's `userId` so users only see their own. Logout removes the session key. Exact shapes:

```ts
type User    = { id: string; email: string; password: string; createdAt: string };
type Session = { userId: string; email: string };
type Habit   = {
  id: string; userId: string; name: string; description: string;
  frequency: 'daily'; createdAt: string; completions: string[];
};
```

See `src/types/auth.ts` and `src/types/habit.ts` for the source.

## PWA Support

- `public/manifest.json` — installability metadata (name, short_name, start_url, display, background_color, theme_color, 192/512 icons)
- `public/icons/icon-192.png`, `public/icons/icon-512.png` — required PWA icons
- `public/sw.js` — service worker that caches the app shell (`/`, `/login`, `/signup`, `/dashboard`, `/manifest.json`) on install and serves cached responses with a network-fallback strategy
- Service worker registered from `src/app/layout.tsx` via an inline script on `window.load`
- After the first visit, the app shell renders offline without a hard crash

## Test File Map

| File | Describe block | What it verifies |
|------|----------------|------------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` | Lowercases, trims, hyphenates spaces, strips non-alphanumerics |
| `tests/unit/validators.test.ts` | `validateHabitName` | Empty rejection, 60-char limit, trimmed valid output |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` | Empty input, today missing, consecutive days, duplicates, gaps |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` | Adds date, removes date, immutable input, no duplicates |
| `tests/integration/auth-flow.test.tsx` | `auth flow` | Signup creates session; duplicate email error; login stores session; bad credentials error |
| `tests/integration/habit-form.test.tsx` | `habit form` | Empty-name validation; create + render; edit preserves immutable fields; delete needs confirmation; toggle updates streak |
| `tests/e2e/app.spec.ts` | `Habit Tracker app` | Full user journey: splash → auth redirects → signup → login isolation → create → complete → reload → logout → offline |

All required test titles match the Stage 3 specification verbatim so they appear unchanged in console output.

## Requirements Mapping

How each section of the technical requirements document maps to the code:

| Spec section | Where it lives |
|---|---|
| §3 Required Stack | `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json` |
| §4 Route Contract — `/` | `src/app/page.tsx` (splash + 1000ms redirect) |
| §4 Route Contract — `/login` | `src/app/login/page.tsx` + `src/components/auth/LoginForm.tsx` |
| §4 Route Contract — `/signup` | `src/app/signup/page.tsx` + `src/components/auth/SignupForm.tsx` |
| §4 Route Contract — `/dashboard` | `src/app/dashboard/page.tsx` (session-protected) |
| §5 Persistence Contract | `src/lib/storage.ts` (keys, shapes, read/write helpers) |
| §6 Folder Structure | repository layout under `src/` and `tests/` |
| §7 Naming Conventions | enforced across `src/components`, `src/lib`, `src/types` |
| §8 Type Contracts | `src/types/auth.ts`, `src/types/habit.ts` |
| §9 Utility Functions | `src/lib/slug.ts`, `validators.ts`, `streaks.ts`, `habits.ts` |
| §10 UI Contract — Splash | `src/components/shared/SplashScreen.tsx` |
| §10 UI Contract — Auth forms | `src/components/auth/LoginForm.tsx`, `SignupForm.tsx` |
| §10 UI Contract — Dashboard / Empty state | `src/app/dashboard/page.tsx` |
| §10 UI Contract — Habit Form | `src/components/habits/HabitForm.tsx` |
| §10 UI Contract — Habit Card / slug-based test ids | `src/components/habits/HabitCard.tsx` |
| §10 UI Contract — Logout | `src/app/dashboard/page.tsx` (`auth-logout-button`) |
| §11 Auth Behavior Rules | `src/components/auth/SignupForm.tsx`, `LoginForm.tsx`, `src/lib/storage.ts` |
| §12 Habit Behavior Rules | `src/app/dashboard/page.tsx`, `src/components/habits/HabitForm.tsx`, `HabitCard.tsx`, `src/lib/habits.ts` |
| §13 PWA Contract | `public/manifest.json`, `public/sw.js`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, registration in `src/app/layout.tsx` |
| §14 Styling | Tailwind classes throughout components (`max-w-2xl`, mobile-first) |
| §15 Accessibility | semantic HTML, `<label htmlFor>`, `<button type="button">`, focus rings via Tailwind, `aria-label` on icon buttons |
| §16 Required Tests | `tests/unit/`, `tests/integration/`, `tests/e2e/app.spec.ts` |
| §17 Coverage | `vitest.config.ts` `coverage.thresholds.lines: 80`, scoped to `src/lib/**` |
| §18 Required Scripts | `package.json` `scripts` |
| §19 README | this file |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # / — splash + redirect
│   ├── login/page.tsx      # /login
│   ├── signup/page.tsx     # /signup
│   ├── dashboard/page.tsx  # /dashboard (protected)
│   └── layout.tsx          # root layout, registers service worker
├── components/
│   ├── auth/               # LoginForm, SignupForm
│   ├── habits/             # HabitCard, HabitForm
│   └── shared/             # SplashScreen
├── lib/                    # Pure utility functions
│   ├── slug.ts             # getHabitSlug
│   ├── validators.ts       # validateHabitName
│   ├── streaks.ts          # calculateCurrentStreak
│   ├── habits.ts           # toggleHabitCompletion
│   └── storage.ts          # localStorage helpers
└── types/
    ├── auth.ts             # User, Session
    └── habit.ts            # Habit

public/
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png

tests/
├── unit/                   # Vitest unit tests
├── integration/            # React Testing Library + Vitest
└── e2e/                    # Playwright
```

## Trade-offs and Limitations

- **No server.** Authentication and data are entirely local. Clearing `localStorage` resets all data, and accounts don't transfer between browsers or devices. This matches the spec's "front-end-focused" constraint (§3).
- **Plain text passwords.** Stored as-is in `localStorage`. Acceptable only because the data never leaves the device; this would never ship to production.
- **`frequency: 'daily'` only.** The type and select element are constrained to `daily` per §5 and §12 of the spec. The schema leaves room for future values without breaking storage.
- **Single-list rendering.** All habits for the user render in one list with no pagination, search, or sort controls. Adequate for the scope of this stage.
- **`Date` is local-time.** Today's date is computed via `new Date().toISOString().split('T')[0]`, which uses UTC. For users far from UTC this could mark "today" a day early or late around midnight. Consistent throughout the app, so streaks remain coherent — but worth flagging.
- **Service worker only registers in production builds** by default browser policy on `localhost`; offline behavior is most reliable after `npm run build && npm run start`.