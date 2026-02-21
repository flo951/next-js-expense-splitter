# Splitify — Expense Splitting Web App

Splitify is a responsive web application for splitting expenses across events. Create an event, add participants, log expenses with a paymaster, and the app calculates the minimum number of payments needed to settle all debts. Includes per-event statistics and chart visualisations.

Full authentication and authorisation — users must register and log in to access their events.

## Tech Stack

- **Framework** — Next.js 16 (Pages Router)
- **Database** — PostgreSQL via Prisma v7 (driver adapter: `@prisma/adapter-pg`)
- **Auth** — Cookie-based sessions, bcrypt password hashing, CSRF protection
- **Styling** — Emotion CSS-in-JS
- **Charts** — Chart.js + react-chartjs-2
- **Image uploads** — Cloudinary
- **Testing** — Jest + React Testing Library

## Prerequisites

- Node.js 22+
- PostgreSQL database (local or hosted, e.g. Neon, Supabase)
- Cloudinary account (for event image uploads)

## Setup

**1. Clone and install**

```bash
git clone https://github.com/flo951/next-js-expense-splitter
cd next-js-expense-splitter
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable                   | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `POSTGRES_PRISMA_URL`      | Pooled database connection URL                       |
| `POSTGRES_URL_NON_POOLING` | Direct database connection URL (used for migrations) |
| `CSRF_SECRET_SALT`         | Secret string for CSRF token generation              |
| `CLOUD_NAME`               | Cloudinary cloud name                                |
| `UPLOAD_PRESET`            | Cloudinary unsigned upload preset                    |

**3. Run database migrations**

```bash
npm run migrate
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Generate Prisma client and build for production
npm start            # Start production server
npm test             # Run unit tests
npm run lint         # Run ESLint
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
npm run migrate      # Create and apply a new database migration
```

## CI/CD

GitHub Actions runs on every push:

- Dependency install (`npm ci`) with caching
- Unit tests (`npm test`)
- Production build (`npm run build`)

A Husky pre-commit hook enforces `npm run lint` and `npm run format:check` before every commit.

## Preview

<div>
<img src="/public/images/eventpic1.png" width="382" height="586">
<img src="/public/images/eventpic2.png" width="382" height="586">
</div>
<div>
<img src="/public/images/eventpic3.png" width="382" height="586">
<img src="/public/images/eventpic4.png" width="382" height="586">
</div>

## Database Schema

<img src="/public/images/drawsql.png" width="900" height="500">
