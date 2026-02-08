# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Splitify is a Next.js expense-splitting web application. Users can create events, add participants, track expenses, and calculate who owes what to whom. Features include user authentication and expense visualization with charts.

## Commands

```bash
# Development
yarn dev              # Start development server at http://localhost:3000

# Build & Production
yarn build            # Generate Prisma client and build for production
yarn start            # Start production server

# Linting & Formatting
yarn lint             # Run ESLint
yarn format           # Format all files with Prettier
yarn format:check     # Check formatting without writing

# Database (Docker PostgreSQL)
yarn db:up            # Start local PostgreSQL in Docker
yarn db:down          # Stop PostgreSQL (keeps data)
yarn db:migrate       # Create and apply Prisma migrations (dev)
yarn db:push          # Push schema changes without migrations (faster for dev)
yarn db:reset         # Reset database (removes all data, pushes schema)
yarn db:studio        # Open Prisma Studio GUI
yarn db:logs          # View PostgreSQL logs

# Testing
yarn jest             # Run unit tests (util/__tests__/)
yarn jest --watch     # Run tests in watch mode
```

## Architecture

### Tech Stack

- **Framework**: Next.js 16 with Pages Router
- **Database**: PostgreSQL via Prisma ORM v7
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
- Prisma v7 uses driver adapters pattern for database connection

## Local Development Setup

### First Time Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Start PostgreSQL in Docker:**
   ```bash
   yarn db:up
   ```

3. **Push database schema:**
   ```bash
   yarn db:push
   ```

4. **Start development server:**
   ```bash
   yarn dev
   ```

### Environment Variables

Required in `.env` (see `.env.example`):

- `POSTGRES_PRISMA_URL` - Database connection URL (defaults to local Docker on port 5432)
- `POSTGRES_URL_NON_POOLING` - Database connection URL (defaults to local Docker on port 5432)
- `CSRF_SECRET_SALT` - CSRF protection secret (use any string for dev)
- `CLOUD_NAME`, `UPLOAD_PRESET` - Cloudinary for image uploads

**Default local setup:** The `.env.example` is pre-configured for the Docker PostgreSQL container. Just copy it to `.env` and you're ready to go.
