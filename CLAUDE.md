# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Splitify is a Next.js expense-splitting web application. Users can create events, add participants, track expenses, and calculate who owes what to whom. Features include user authentication, expense visualization with charts, and email notifications.

## Commands

```bash
# Development
yarn dev              # Start development server at http://localhost:3000

# Build & Production
yarn build            # Generate Prisma client and build for production
yarn start            # Start production server

# Linting
yarn lint             # Run ESLint

# Database
yarn migrate up       # Run database migrations
yarn migrate down     # Rollback migrations

# Testing
yarn jest             # Run unit tests (util/__tests__/)
yarn jest --watch     # Run tests in watch mode
yarn jest util/__tests__/splitExpenses.test.ts  # Run single test file
```

For E2E tests with Puppeteer (integration/), uncomment the jest-puppeteer preset in `jest.config.mjs` and run against a built app (`yarn build && yarn start`).

## Architecture

### Tech Stack

- **Framework**: Next.js with Pages Router
- **Database**: PostgreSQL via Prisma ORM
- **Styling**: Emotion CSS-in-JS
- **Auth**: Cookie-based sessions with bcrypt password hashing

### Directory Structure

- `pages/` - Next.js pages and API routes
  - `api/` - REST endpoints (login, register, profile, event, person, expense)
  - `users/[eventId].tsx` - Dynamic event detail page
- `components/` - React components (Layout, Header, BarChart, ExpenseList, PeopleList)
- `util/` - Core utilities
  - `database.ts` - All Prisma queries (users, sessions, events, people, expenses)
  - `splitPayments.ts` - Algorithm to calculate debt settlement between participants
  - `auth.ts`, `cookies.ts` - Authentication helpers
- `prisma/schema.prisma` - Database schema

### Data Model

- **users** → has many **events**, **sessions**, **people**
- **events** → has many **people**, **expenses**
- **people** → can be paymaster for **expenses**
- **sessions** → token-based with 24h expiry

### Key Patterns

- User state managed in `_app.tsx` via `/api/profile` endpoint
- All database operations go through `util/database.ts`
- Authorization checks use `getUserByValidSessionToken()` with session cookie

## Environment Variables

Required in `.env` (see `.env.example`):

- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` - Database connection
- `CSRF_SECRET_SALT` - CSRF protection
- `CLOUD_NAME`, `UPLOAD_PRESET` - Cloudinary for image uploads
- `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` - Gmail API for email sending
