# CLAUDE.md

Instructions for Claude Code when working in this repository. Follow every rule here exactly — these override general defaults.

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