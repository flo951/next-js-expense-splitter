# CLAUDE.md

Senior developer instructions for Claude Code when working in this repository. Follow every rule here exactly — these override general defaults.

---

## Project Overview

**Splitify** is a Next.js expense-splitting app (Pages Router). Users create events, add participants, log expenses, and see who owes whom. Stack: Next.js 16, PostgreSQL via Prisma v7, Emotion CSS-in-JS, cookie-based auth, Chart.js.

---

## Commands

```bash
# Development
yarn dev               # Start dev server at http://localhost:3000

# Build & Production
yarn build             # Generate Prisma client then build
yarn start             # Start production server

# Linting & Formatting
yarn lint              # Run ESLint (must pass before committing)
yarn format            # Format all files with Prettier
yarn format:check      # Check formatting without writing

# Database
yarn migrate           # Create and apply a new migration (dev only)
                       # Alias for: prisma migrate dev

# Testing
yarn jest              # Run all unit tests
yarn jest --watch      # Watch mode
```

**Pre-commit checklist:** `yarn lint && yarn format:check && yarn jest`

---

## Architecture

### Directory Structure

```
pages/
  api/            REST endpoints — login, register, profile, event, person, expense
  users/[eventId] Dynamic event detail page
components/       Layout, Header, BarChart, ExpenseList, PeopleList
util/
  database.ts     ALL Prisma queries live here — the only place
  splitPayments.ts Debt-settlement algorithm
  auth.ts         CSRF token create/verify
  cookies.ts      Session cookie serialization
prisma/
  schema.prisma   DB schema
  migrations/     Prisma migration files
styles/styles.ts  Global Emotion styles
```

### Data Model (quick reference)

```
users      → sessions, events, people (1-many)
events     → people, expenses (1-many)
people     → expenses (paymaster), expense_participants (1-many)
expenses   → expense_participants (join table, many-to-many with people)
sessions   → token, expiry_timestamp (24h), user_id
```

---

## Code Conventions

- **TypeScript strict mode is on.** No `any`. Use `unknown` + narrowing or a proper interface. No type assertions (`as X`) without a comment explaining why.
- **Prettier/ESLint:** no semicolons, single quotes, trailing commas. Run `yarn format` before committing.
- **Naming:** `camelCase` for functions/variables, `PascalCase` for components and types, `snake_case` only in Prisma schema column names.
- No barrel `index.ts` re-exports — import directly from the source file.
- Prefer `const`. Use `let` only when reassignment is necessary.
- No `console.log` in committed code — ESLint warns about it. Use proper error handling.

---

## Database Layer

**Rule:** ALL database access goes through `util/database.ts`. Never import `PrismaClient` in pages, API routes, or components.

### Prisma v7 Driver Adapters

This project uses `@prisma/adapter-pg`. The Prisma client is instantiated with the adapter — do not use the bare `new PrismaClient()` constructor without it.

### Adding New Queries

Add a typed function to `util/database.ts`. Export the return type if consumers need it. Example:

```ts
export type MyEntity = { id: number; name: string }

export async function getMyEntityById(id: number): Promise<MyEntity | null> {
  return await prisma.myEntity.findUnique({ where: { id } })
}
```

### Financial Data — Costs Are Always Integers (Cents)

- **Never store floats.** €1.50 is stored as `150`.
- On write (from user input): `Math.round(parseFloat(input) * 100)`
- On read (for display): `cost / 100`
- After any arithmetic: `Math.round(result * 100) / 100`

### Migrations

Use **Prisma migrate**:
- `yarn migrate` (`prisma migrate dev`) — create and apply a new migration locally; prompts for a migration name

Never use `prisma db push` — it bypasses the migration history.

---

## API Route Patterns

Every handler must follow this exact order:

1. **Method check** — return 405 if the method is wrong
2. **CSRF verification** — for all mutations (POST, DELETE)
3. **Session auth** — verify session cookie, return 401 if invalid
4. **Input validation** — return 400 with message if invalid
5. **DB operation** — through `util/database.ts`
6. **Typed response** — discriminated union type

### Auth Guard Idiom

```ts
const user = await getUserByValidSessionToken(request.cookies.sessionToken)
if (!user) {
  return response.status(401).json({ errors: [{ message: 'Unauthorized' }] })
}
```

### Response Type Shape

```ts
type ResponseBody =
  | { errors: { message: string }[] }
  | { event: Event }
```

- **201** — resource created
- **200** — retrieval success
- **400** — validation failure
- **401** — auth failure
- **405** — wrong HTTP method

Never return 200 with an `errors` field. Use the correct status code.

---

## Authentication & Security

- **CSRF:** every POST/DELETE handler verifies the CSRF token before any DB write. Use `verifyCsrfToken()` from `util/auth.ts`.
- **Session tokens:** `crypto.randomBytes(64).toString('base64')`, stored in `sessions` table with 24h expiry.
- **Passwords:** bcrypt with **12** salt rounds. Do not change this.
- **Cookies:** always use `createSerializedRegisterSessionTokenCookie()` from `util/cookies.ts`. Never craft cookies manually.
- **Never expose `password_hash`** in API responses. Use the `User` type, not `UserWithPasswordHash`, in responses.

---

## Page-Level Authorization

- Protected pages use `getServerSideProps` to check the session **before** rendering — SSR check is the source of truth.
- If session is invalid, redirect to `/login` or return `{ props: { errors: 'Not logged in' } }`.
- Never use client-side-only auth guards as the primary protection.
- Do not use `getStaticProps` or `getStaticPaths` for authenticated pages.

---

## State Management

- No external state library (no Redux, Zustand, new Context). User state lives in `_app.tsx`, fetched once from `/api/profile`.
- Components receive data as props from `getServerSideProps` or via local `useState` + `fetch`.
- After mutations (add/delete), re-fetch the relevant data inside the component to reflect the new state — no optimistic updates.

---

## Styling (Emotion CSS-in-JS)

- All styles use the `css` tagged template literal from `@emotion/react`, applied via the `css` prop.
- No plain CSS files, CSS Modules, or `styled` components unless a wrapper component is genuinely needed.
- Keep styles co-located with the component that uses them.
- Global styles go in `styles/styles.ts` only.
- Media queries inline within the component's `css` block.

---

## Settlement Algorithm

- Lives in `util/splitPayments.ts` — do not duplicate or inline this logic.
- `calculateSettlements(balances: Balances): Transaction[]` — `Balances` is `Record<personName, number>` where positive = owed money, negative = owes money.
- `splitPayments()` is the legacy string-output wrapper — use `calculateSettlements` for new code.
- Keep balance computation in the component or a dedicated helper, not inside DB queries.

---

## Testing

- Unit tests: `util/__tests__/` and `components/__tests__/`
- Run `yarn jest` before pushing changes to any utility or component.
- **New functions in `util/`** require corresponding unit tests.
- Use `@testing-library/react` for component tests — test behavior, not implementation details.
- Do not mock Prisma for pure-function tests (`splitPayments`, `auth`, `cookies`) — they have no DB dependency.
- Add `data-test-id` attributes to JSX elements that tests need to target.

---

## Common Pitfalls

| Do NOT | Reason |
|--------|--------|
| Import PrismaClient outside `util/database.ts` | Breaks connection pooling, violates architecture |
| Store cost as a float | Floating-point errors in financial math |
| Skip CSRF check on mutations | Security vulnerability |
| Use `any` type | Defeats TypeScript strict mode |
| Use `getStaticProps` on auth pages | Page won't re-check session |
| Add dependencies without checking existing ones | Bundle bloat, complexity |
| Use `console.log` in committed code | ESLint will warn; handle errors properly |
| Use `prisma db push` | Bypasses migration history; use `prisma migrate dev` instead |
| Manually write cascade-delete logic | Check Prisma schema for cascade rules first |
| Create new API routes without the method/auth/CSRF guard pattern | Inconsistency and security gaps |

---

## Environment Variables

Required in `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `POSTGRES_PRISMA_URL` | Pooled DB connection (app queries) |
| `POSTGRES_URL_NON_POOLING` | Direct DB connection (migrations) |
| `CSRF_SECRET_SALT` | CSRF token generation |
| `CLOUD_NAME` | Cloudinary account name |
| `UPLOAD_PRESET` | Cloudinary unsigned upload preset |
