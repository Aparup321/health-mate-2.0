# Agent Guidelines for Health-Mate

## Project Overview

Health-Mate is a gamified wellness platform with two sub-projects in a monorepo:

- **`backend/`** — Node.js/Express REST API (Bun runtime, TypeScript, MongoDB)
- **`mobile/`** — React Native / Expo mobile app (TypeScript, NativeWind/Tailwind)

Core features: work session timers (Pomodoro-style), activity logging (hydration, exercise, breaks, smoking), gamification (XP points, achievements, streaks, tiers), global/peer leaderboards, and scheduled reminders.

**Auth:** JWT + bcrypt (self-managed; Clerk was removed). Tokens are extracted server-side from `Authorization: Bearer <token>` headers — never include `userId` in request bodies.

**API base URL:** `http://localhost:3000/api/v1`  
**Tiers:** Bronze (0–499 pts) → Silver (500–1999) → Gold (2000–4999) → Platinum (5000+)

---

## Build, Lint & Test Commands

### Backend (`backend/`)

```bash
bun install              # Install dependencies
bun run dev              # Development with hot reload (--hot)
bun start                # Production start
bun run build            # Installs dependencies (no compile step — Bun runs TS directly)
```

### Running Tests (Backend)

No test framework is configured yet. When added, use Bun's built-in runner:

```bash
bun test                                        # Run all tests
bun test src/path/to/file.test.ts               # Run a single test file
bun test --watch                                # Watch mode
bun test src/controllers/authController.test.ts # Example single test
```

Place tests at `src/**/__tests__/**/*.test.ts` or `src/**/*.test.ts`.

### Mobile (`mobile/`)

```bash
bun install              # Install dependencies (bun preferred over npm)
expo start               # Start Expo dev server
expo start --android     # Android emulator
expo start --ios         # iOS simulator
expo lint                # ESLint (eslint-config-expo/flat)
```

No Prettier config exists yet. ESLint uses `eslint-config-expo` flat config (`eslint.config.js`).

---

## Repository Structure

```
health-mate/
├── backend/
│   ├── index.ts                  # Server entry point
│   ├── src/
│   │   ├── app.ts                # Express app, middleware, route wiring
│   │   ├── config/database.ts    # MongoDB connection
│   │   ├── controllers/          # Route handlers (one file per domain)
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts      # requireAuth, optionalAuth, requireOwnership
│   │   │   ├── errorMiddleware.ts     # Global error + 404 handlers
│   │   │   └── validationMiddleware.ts # validateRequest/Query/Params (Zod)
│   │   ├── models/               # Mongoose schemas + interfaces (PascalCase.ts)
│   │   ├── routes/               # Express routers (camelCase.ts)
│   │   ├── scripts/              # One-off migration/seed scripts
│   │   └── utils/
│   │       ├── errorHandler.ts   # APIError classes + sendSuccessResponse/sendErrorResponse
│   │       ├── gameEngine.ts     # Points, achievements, streaks, leaderboard logic
│   │       ├── jwtUtils.ts       # Token generation/verification
│   │       └── reminderEngine.ts # node-schedule cron jobs
│   └── tsconfig.json
└── mobile/
    ├── app/                      # Expo Router file-based routing
    │   ├── (auth)/               # Login/signup screens
    │   ├── (onboarding)/         # Health profile setup
    │   └── (tabs)/               # Main tab navigator (Dashboard, Activities, Leaderboard, Stats, Settings)
    ├── components/               # Shared UI components (Card, Button, StatCard, ProgressBar…)
    ├── services/
    │   ├── api.ts                # Typed API client with auto token-refresh
    │   ├── auth.tsx              # AuthProvider context
    │   └── types.ts              # All request/response TypeScript types
    └── tailwind.config.js
```

---

## Code Style — Backend (TypeScript / Express)

### TypeScript Strict Mode (`tsconfig.json`)

```
strict: true, noUncheckedIndexedAccess: true,
noImplicitOverride: true, noFallthroughCasesInSwitch: true
noUnusedLocals/Parameters: false (relaxed during development)
```

Never use `any` except in middleware params for compatibility.

### Imports

```typescript
// Named imports; type-only with 'type' keyword
import express from "express";
import { type Request, type Response, type NextFunction } from "express";
import type { IUser } from "../models/User";

// NO wildcard imports: import * as x from "..."
// NO default utility imports: import utils from "./utils"
```

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Model/Interface files | `PascalCase.ts` | `HealthProfile.ts` |
| Utility/route/controller files | `camelCase.ts` | `gameEngine.ts`, `authRoutes.ts` |
| Functions | `camelCase` | `calculateBMI()`, `sendSuccessResponse()` |
| Interfaces | `PascalCase` prefixed `I` | `IUser`, `IHealthProfile` |
| Constants | `UPPER_SNAKE_CASE` | `POINTS_CONFIG`, `TIER_THRESHOLDS` |
| DB fields | `camelCase` | `clerkId`, `createdAt` |

### Models Pattern

```typescript
export interface IUser extends Document {
  clerkId: string;          // Always extend Document
  email: string;
  createdAt: Date;          // timestamps: true handles these
}
const UserSchema = new Schema<IUser>({ ... }, { timestamps: true });
export const User = mongoose.model("User", UserSchema);
```

Always use `{ timestamps: true }`, schema generics `new Schema<IModel>()`, `trim: true` on strings, and `lowercase: true` on emails.

### Controllers Pattern

```typescript
// Use asyncHandler or express-async-errors for automatic error propagation
export async function createProfile(req: Request, res: Response): Promise<void> {
  const userId = req.userId!;           // Extracted by requireAuth middleware
  const data = req.validatedBody!;      // Set by validateRequest middleware
  const profile = await HealthProfile.create({ userId, ...data });
  sendSuccessResponse(res, 201, profile, "Profile created");
  // On error: throw new APIError / NotFoundError / etc. — middleware catches it
}
```

### Error Handling

```typescript
// Use custom error classes — never send raw errors
throw new NotFoundError("Profile not found");       // 404
throw new UnauthorizedError("Token required");      // 401
throw new ValidationError("Bad input", { field: ["msg"] }); // 400
throw new ConflictError("Already exists");          // 409

// Always type-guard unknown errors
const msg = error instanceof Error ? error.message : "Unknown error";
```

### Validation

All `POST`/`PUT` routes must use `validateRequest(zodSchema)` middleware. Use `z.coerce.date()` (not `z.date()`) for date fields from JSON. Make `userId` optional in schemas — controllers extract it from JWT.

### Environment Variables

Required: `PORT`, `DB_URI`, `JWT_SECRET`, `CORS_ORIGIN`  
All secrets in `.env` (git-ignored). Validate at startup — fail fast.

---

## Code Style — Mobile (React Native / Expo)

### Stack

React Native 0.81, Expo SDK 54, Expo Router v6 (file-based routing), NativeWind v4 (Tailwind CSS for RN), React 19.

### Component Conventions

```tsx
// Named exports for screens; default export only for Expo Router layouts
export default function DashboardScreen() { ... }

// Prop types inline for small components, interface for reused ones
function QuickAction({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) { ... }
```

### Styling

Use NativeWind `className` prop (Tailwind classes). Design system uses slate-900 background, emerald-500 for primary actions, and slate-800 for cards. Avoid inline `style` except for dynamic values (e.g. tier-specific colors).

### API Calls

All API calls go through `services/api.ts`. Import domain namespaces:

```tsx
import { gamificationApi, workSessionsApi } from "@/services/api";
import type { PointsResponse } from "@/services/types";
```

Use `Promise.allSettled` for parallel non-critical fetches. Wrap in `try/catch`; non-critical failures may be silently ignored. The API client handles 401 → token refresh automatically.

### Path Aliases

Use `@/` for project root imports: `import Card from "@/components/Card"`.

---

## API Conventions

- **Base path:** `/api/v1`
- **Auth:** `Authorization: Bearer <token>` header on all protected routes
- **Success response:** `{ success: true, message: string, data: T }`
- **Error response:** `{ success: false, error: { message, errors? } }`
- **Date fields:** Always ISO 8601 strings (e.g. `"2026-03-11T00:00:00.000Z"`)
- **Do not** send `userId` in request bodies — it is extracted from the JWT

Key route groups: `/auth`, `/health-profile`, `/work-sessions`, `/activities/{hydration|exercise|breaks|smoking}`, `/gamification/{points|achievements|streaks|tier}`, `/leaderboards`, `/peer-challenges`, `/reminders`

---

## Development Workflow

1. Branch: `git checkout -b feature/feature-name`
2. Backend changes: add model → controller → route → wire in `app.ts`
3. Mobile changes: add screen in `app/` or component in `components/`
4. Verify: `bun run dev` (backend), `expo start` (mobile)
5. Commit: `feat: add X` / `fix: Y` / `refactor: Z`

---

## Notes for Agents

1. **Bun, not npm/node** — all backend commands use `bun`
2. **JWT auth** — Clerk is gone; use `req.userId` set by `requireAuth` middleware
3. **Zod v4** — `z.coerce.date()` for dates, schemas for all POST/PUT bodies
4. **Mongoose 9.3** — async pre-save hooks must NOT call `next()` param
5. **Express-async-errors** is installed — thrown errors propagate automatically
6. **Mobile is active** — `mobile/` has a functioning Expo app with screens, services, and components; it is not empty
7. **No test suite yet** — when writing tests use Bun's built-in runner
8. **Postman collection** — `Health-Mate-API-Updated.postman_collection.json` has all 38+ endpoints pre-configured
