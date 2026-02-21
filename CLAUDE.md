# CLAUDE.md

Instructions for Claude Code when working in this repository. Follow every rule here exactly — these override general defaults.

---

## Project Overview

**Splitify** is a Next.js expense-splitting app (Pages Router). Users create events, add participants, log expenses, and see who owes whom. Stack: Next.js 16, PostgreSQL via Prisma v7, Emotion CSS-in-JS, cookie-based auth, Chart.js.

---

## Commands

```bash
# Development
npm run dev            # Start dev server at http://localhost:3000

# Build & Production
npm run build          # Generate Prisma client then build
npm start              # Start production server

# Linting & Formatting
npm run lint           # Run ESLint (must pass before committing)
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without writing

# Database
npm run migrate        # Create and apply a new migration (prisma migrate dev)

# Testing
npm test               # Run all unit tests
npm test -- --watch    # Watch mode
```

**Pre-commit checklist:** `npm run lint && npm run format:check && npm test`
