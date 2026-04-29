# Habit Tracker PWA

A mobile-first Progressive Web App for tracking daily habits, built with Next.js, React, TypeScript, and Tailwind CSS.

## Setup

```bash
npm install
```

## Running the App

```bash
npm run dev       # development server at http://localhost:3000
npm run build     # production build
npm run start     # production server
```

## Running Tests

```bash
npm run test:unit          # Vitest unit tests with coverage
npm run test:integration   # Vitest integration/component tests
npm run test:e2e           # Playwright end-to-end tests
npm run test               # all tests
```

For E2E tests, ensure the dev server is running first, or Playwright's webServer config will start it automatically.

Install Playwright browsers if needed:
```bash
npx playwright install chromium
```

## Local Persistence Structure

All data is stored in `localStorage` using three keys:

| Key | Shape | Description |
|-----|-------|-------------|
| `habit-tracker-users` | `User[]` | All registered users |
| `habit-tracker-session` | `Session \| null` | Active session |
| `habit-tracker-habits` | `Habit[]` | All habits across users |

See `src/types/auth.ts` and `src/types/habit.ts` for exact type shapes.

## PWA Support

- `public/manifest.json` — installability metadata
- `public/sw.js` — service worker that caches the app shell on first load
- Service worker registered in `src/app/layout.tsx` via inline script
- After first visit, the app shell renders offline without a hard crash

## Test File Map

| File | What it verifies |
|------|-----------------|
| `tests/unit/slug.test.ts` | `getHabitSlug` converts names to URL-safe slugs |
| `tests/unit/validators.test.ts` | `validateHabitName` enforces length and required rules |
| `tests/unit/streaks.test.ts` | `calculateCurrentStreak` counts consecutive days correctly |
| `tests/unit/habits.test.ts` | `toggleHabitCompletion` adds/removes dates immutably |
| `tests/integration/auth-flow.test.tsx` | Signup/login forms create sessions and show errors |
| `tests/integration/habit-form.test.tsx` | Habit CRUD, validation, deletion confirmation, streak display |
| `tests/e2e/app.spec.ts` | Full user journeys from splash screen to offline support |

## Architecture

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # / — splash + redirect
│   ├── login/page.tsx    # /login
│   ├── signup/page.tsx   # /signup
│   └── dashboard/page.tsx # /dashboard (protected)
├── components/
│   ├── auth/             # LoginForm, SignupForm
│   ├── habits/           # HabitCard, HabitForm
│   └── shared/           # SplashScreen
├── lib/                  # Pure utility functions
│   ├── slug.ts           # getHabitSlug
│   ├── validators.ts     # validateHabitName
│   ├── streaks.ts        # calculateCurrentStreak
│   ├── habits.ts         # toggleHabitCompletion
│   └── storage.ts        # localStorage helpers
└── types/
    ├── auth.ts           # User, Session
    └── habit.ts          # Habit
```

## Trade-offs and Limitations

- **No server**: auth and data are entirely local — clearing localStorage resets all data
- **Plain text passwords**: stored as-is in localStorage (acceptable for a local-only demo)
- **Single device**: data does not sync across devices or browsers
- **No pagination**: all habits render in a single list
