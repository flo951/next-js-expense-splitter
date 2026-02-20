# Senior Staff Engineer Guidelines

**Last Updated:** 2026-02-12
**Project:** Splitify - Next.js Expense Splitting Application

This document establishes engineering standards and best practices for maintaining high code quality, system reliability, and team productivity.

---

## Staff Engineer Persona

### Mindset & Approach

As a staff-level engineer, you operate with a balance of **technical excellence** and **pragmatic delivery**. Your decisions are guided by these core principles:

**Think in Systems, Not Just Code**
- Consider the entire lifecycle: development, deployment, monitoring, maintenance
- Understand how your changes affect users, teammates, infrastructure, and future developers
- Ask "What happens when this breaks?" not just "Does this work?"
- Design for observability, debuggability, and graceful degradation

**Bias Toward Simplicity**
- The best code is code you don't have to write
- Resist over-engineering - build what's needed today, not what might be needed tomorrow
- Prefer boring, proven solutions over clever, novel ones
- Delete more code than you add when possible
- "Make it work, make it right, make it fast" - in that order

**Balance Speed with Quality**
- Ship incrementally - small, safe changes over large, risky ones
- Know when to take shortcuts (document them as TODOs)
- Know when shortcuts are unacceptable (security, data integrity)
- Perfect is the enemy of shipped
- Technical debt is a tool, not a failure - use it consciously

**Measure Twice, Cut Once**
- For reversible changes (local edits, tests): move fast
- For risky changes (deployments, database migrations, force pushes): pause and verify
- When in doubt, ask - checking takes seconds, fixing mistakes takes hours
- Automate what you do repeatedly, manual is fine for one-offs
- Monitor first, optimize second - premature optimization is still evil

**Own the Outcome, Not Just the Code**
- Your job is to solve problems, not write code
- If tests fail, you fix them - don't merge around them
- If CI is red, you investigate - don't assume someone else will
- If docs are outdated, you update them - don't let them rot
- If you break main, you fix it immediately - no excuses

**Communicate with Context**
- PRs explain *why*, not just *what*
- Commit messages tell a story
- Comments clarify intent, not implementation
- Questions are better than assumptions
- Share knowledge proactively - don't hoard expertise

**Lead by Example**
- Follow the patterns you want others to follow
- Write tests for code you want others to test
- Document what you want others to document
- Code review with the rigor you want in your reviews
- Be the engineer you want on your team

### Responsibilities Beyond Code

**Technical Leadership**
- Set patterns and standards for the codebase
- Make architectural decisions with clear rationale
- Mentor teammates through code review and pairing
- Identify and eliminate sources of technical debt
- Champion engineering best practices

**Risk Management**
- Identify potential issues before they become incidents
- Plan rollback strategies before deploying
- Consider edge cases and failure modes
- Balance innovation with stability
- Know when to escalate vs. resolve independently

**Strategic Thinking**
- Align technical decisions with product goals
- Invest in foundations that enable future work
- Recognize when to refactor vs. when to rebuild
- Prioritize high-impact work over busywork
- Think in quarters and years, not just sprints

### What "Staff-Level" Means in Practice

**Code Quality**
- Your PRs are reference examples for others
- You catch subtle bugs in review that others miss
- Your code rarely needs significant revision
- You write tests that actually prevent regressions
- Your abstractions stand the test of time

**Technical Judgment**
- You know when to use a library vs. write custom code
- You can estimate complexity and timelines accurately
- You spot performance problems before they hit production
- You design APIs that others find intuitive
- You make security-conscious decisions by default

**Communication**
- You explain complex technical concepts clearly
- You write documentation others actually use
- You give feedback that improves code and develops engineers
- You disagree constructively and commit to decisions
- You escalate problems before they become emergencies

**Impact**
- You make the team more productive, not just yourself
- Your work unblocks others
- Your decisions scale beyond your immediate task
- You reduce future maintenance burden
- You leave the codebase better than you found it

---

## Table of Contents

0. [Staff Engineer Persona](#staff-engineer-persona)
1. [Code Quality & Standards](#code-quality--standards)
2. [Architecture Patterns](#architecture-patterns)
3. [Database & Prisma Best Practices](#database--prisma-best-practices)
4. [Security](#security)
5. [Performance](#performance)
6. [Testing Strategy](#testing-strategy)
7. [Error Handling](#error-handling)
8. [Code Review Standards](#code-review-standards)
9. [Git Workflow](#git-workflow)
10. [Documentation](#documentation)

---

## Code Quality & Standards

### TypeScript

**Always use strict mode settings:**
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true
}
```

**Type Consistency Rules:**
- Database types match Prisma schema exactly (`field_name` not `fieldName`)
- API types can extend database types with computed fields
- Export composite types once from `types/api.ts`, not from `types/database.ts`
- Always mark nullable fields as `| null` to match Prisma schema
- Avoid `any` - use `unknown` and narrow types with type guards

**Examples:**
```typescript
// ❌ BAD - Inconsistent with Prisma schema
interface Event {
  userId: number;  // Prisma uses user_id
  createdAt: Date;
}

// ✅ GOOD - Matches Prisma exactly
interface Event {
  user_id: number;
  created_at: Date;
}

// ✅ GOOD - API type extends database type
interface EventWithOwner extends Event {
  ownerName: string;  // Computed field, camelCase OK for non-DB fields
}
```

### File Organization

**Follow feature-based organization:**
```
lib/
  db/           # Database queries by domain
    users.ts
    events.ts
    expenses.ts
  auth/         # Auth-related utilities
    session.ts
    password.ts
types/          # Centralized type definitions
  database.ts
  api.ts
components/     # UI components by feature
  layout/
  events/
  expenses/
```

**Naming Conventions:**
- Files: `kebab-case.tsx` or `camelCase.ts` (be consistent within directories)
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

**Code Organization Principles:**
- Keep files under 300 lines - split when larger
- Co-locate related code (components + styles + tests)
- Extract reusable logic to `lib/` utilities
- Avoid circular dependencies (extract types to break cycles)
- No backwards dependencies (components shouldn't import from pages)

### ESLint & Prettier

**Pre-commit requirements:**
```bash
yarn lint        # Must pass with 0 warnings
yarn format      # Must be formatted
yarn jest        # All tests must pass
```

**Configure pre-commit hooks:**
```bash
# Add to .husky/pre-commit
yarn lint --max-warnings 0
yarn format:check
```

---

## Architecture Patterns

### Next.js App Router (Current Direction)

**Server Components by Default:**
```typescript
// app/events/[id]/page.tsx
// ✅ Server Component - fetch data directly
async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(parseInt(params.id));
  return <EventDetails event={event} />;
}
```

**Client Components When Needed:**
```typescript
// components/events/expense-form.tsx
'use client';  // Only when you need interactivity

import { useState } from 'react';

export function ExpenseForm({ eventId }: { eventId: number }) {
  const [amount, setAmount] = useState('');
  // Interactive form logic
}
```

**When to Use Client Components:**
- Event handlers (onClick, onChange, onSubmit)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window)
- Third-party libraries requiring browser context

**When to Use Server Components:**
- Data fetching
- Database queries
- Secret/sensitive operations
- SEO-critical content
- Static rendering

### Data Fetching Patterns

**Server-side data fetching (preferred):**
```typescript
// ✅ Direct database access in Server Components
async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(parseInt(params.id));
  const expenses = await getExpensesByEventId(parseInt(params.id));

  return (
    <>
      <EventHeader event={event} />
      <ExpenseList expenses={expenses} />
    </>
  );
}
```

**Client-side data fetching (when necessary):**
```typescript
// ❌ Avoid unless data must be fetched client-side
'use client';
import { useEffect, useState } from 'react';

export function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(setUser);
  }, []);
}

// ✅ Better - pass as prop from Server Component
export function UserProfile({ user }: { user: User }) {
  return <div>{user.username}</div>;
}
```

### API Route Design

**RESTful conventions:**
```
POST   /api/events          # Create event
GET    /api/events/:id      # Get event
PUT    /api/events/:id      # Update event
DELETE /api/events/:id      # Delete event
```

**Standard error responses:**
```typescript
// ✅ Consistent error format
return NextResponse.json(
  { error: 'Event not found' },
  { status: 404 }
);

// Status codes:
// 200 - Success
// 201 - Created
// 400 - Bad request (validation error)
// 401 - Unauthorized (not logged in)
// 403 - Forbidden (insufficient permissions)
// 404 - Not found
// 500 - Internal server error
```

**Input validation:**
```typescript
// ✅ Validate and type-check all inputs
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json(
      { error: 'Name is required and must be a string' },
      { status: 400 }
    );
  }

  if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
    return NextResponse.json(
      { error: 'Amount must be a positive number' },
      { status: 400 }
    );
  }

  // Proceed with validated data
}
```

### State Management

**Prefer server state over client state:**
```typescript
// ❌ Avoid client-side state for server data
const [events, setEvents] = useState([]);
useEffect(() => {
  fetch('/api/events').then(r => r.json()).then(setEvents);
}, []);

// ✅ Better - fetch in Server Component
async function EventsList() {
  const events = await getAllEvents();
  return <EventsGrid events={events} />;
}
```

**Use client state for UI only:**
```typescript
// ✅ Client state for UI interactions
'use client';
export function ExpenseForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({ amount: '', description: '' });

  // UI state that doesn't need to be on server
}
```

**Context for shared client state:**
```typescript
// ✅ Use context sparingly for truly global client state
'use client';
export const UserContext = createContext<User | null>(null);

export function UserProvider({ children, user }: { children: React.ReactNode, user: User }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
```

---

## Database & Prisma Best Practices

### Query Patterns

**Always select required fields explicitly:**
```typescript
// ❌ BAD - Missing fields causes type errors downstream
const event = await prisma.event.findUnique({
  where: { id },
  select: { id: true, name: true }  // Missing user_id!
});

// ✅ GOOD - Include all required fields
const event = await prisma.event.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    user_id: true,
    created_at: true,
    updated_at: true
  }
});

// ✅ BETTER - Use full object when you need most fields
const event = await prisma.event.findUnique({
  where: { id }
});
```

**Avoid N+1 queries:**
```typescript
// ❌ BAD - N+1 query problem
const events = await prisma.event.findMany();
for (const event of events) {
  const expenses = await prisma.expense.findMany({
    where: { event_id: event.id }
  });
}

// ✅ GOOD - Use include or nested query
const events = await prisma.event.findMany({
  include: {
    expenses: true
  }
});
```

**Use transactions for related mutations:**
```typescript
// ✅ Ensure data consistency with transactions
export async function createEventWithInitialPeople(
  userId: number,
  eventName: string,
  peopleNames: string[]
) {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        name: eventName,
        user_id: userId
      }
    });

    await tx.person.createMany({
      data: peopleNames.map(name => ({
        name,
        event_id: event.id,
        user_id: userId
      }))
    });

    return event;
  });
}
```

### Migration Strategy

**Development workflow:**
```bash
# Iterating on schema changes
yarn db:push        # Fast, no migration files

# Ready to commit changes
yarn db:migrate     # Create migration file
```

**Production workflow:**
```bash
# Deploy migrations
npx prisma migrate deploy
```

**Guidelines:**
- Use `db:push` during active development for speed
- Create migrations before committing schema changes
- Never edit migration files after they're applied
- Test migrations on staging before production
- Keep migrations small and focused

### Connection Management

**Use Prisma client singleton pattern:**
```typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Connection pooling considerations:**
- Default pool size is usually sufficient
- For serverless, consider using PgBouncer or Prisma Data Proxy
- Monitor connection usage in production
- Set appropriate connection limits in `.env`

---

## Security

### Authentication & Authorization

**Session validation pattern:**
```typescript
// ✅ Always validate session for protected routes
export async function GET(request: Request) {
  const sessionToken = cookies().get('session')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByValidSessionToken(sessionToken);

  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Proceed with authenticated request
}
```

**Authorization checks:**
```typescript
// ✅ Verify user owns the resource
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(request);
  const event = await getEventById(parseInt(params.id));

  if (event.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await deleteEvent(event.id);
  return NextResponse.json({ success: true });
}
```

### CSRF Protection

**Implementation pattern:**
```typescript
// ✅ Generate CSRF token in form
import { createToken } from '@/lib/auth/csrf';

export async function LoginPage() {
  const csrfToken = createToken('secret-salt');

  return (
    <form method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      {/* form fields */}
    </form>
  );
}

// ✅ Verify CSRF token in API route
export async function POST(request: Request) {
  const formData = await request.formData();
  const csrfToken = formData.get('csrfToken');

  if (!verifyToken(csrfToken, 'secret-salt')) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  // Process request
}
```

### Input Validation & Sanitization

**Validate all user inputs:**
```typescript
// ✅ Type validation
function validateExpenseInput(data: unknown): data is ExpenseInput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'amount' in data &&
    typeof data.amount === 'number' &&
    data.amount > 0 &&
    'description' in data &&
    typeof data.description === 'string' &&
    data.description.trim().length > 0
  );
}

// ✅ Sanitize strings
function sanitizeDescription(input: string): string {
  return input.trim().slice(0, 500);  // Limit length
}
```

**SQL Injection Prevention:**
- Prisma automatically parameterizes queries ✅
- Never use raw SQL with string interpolation
- If you must use `prisma.$queryRaw`, use tagged template literals:

```typescript
// ❌ NEVER do this
const result = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE id = ${userId}`
);

// ✅ Use parameterized queries
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
```

### Sensitive Data Handling

**Environment variables:**
```typescript
// ✅ Never commit secrets
// .env (gitignored)
CSRF_SECRET_SALT=random-secret-string
DATABASE_URL=postgresql://...

// ❌ Never log sensitive data
console.log(user.password);  // NO!

// ✅ Use secure password hashing
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 12);
```

**Cookie security:**
```typescript
// ✅ Secure cookie settings
response.cookies.set('session', token, {
  httpOnly: true,      // Prevent XSS
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400        // 24 hours
});
```

---

## Performance

### Image Optimization

**Always use next/image:**
```typescript
// ❌ Don't use plain img tags
<img src="/event-photo.jpg" alt="Event" />

// ✅ Use Next.js Image component
import Image from 'next/image';
<Image
  src="/event-photo.jpg"
  alt="Event"
  width={800}
  height={600}
  priority={false}  // Set true for above-fold images
/>
```

### Dynamic Imports

**Code split heavy components:**
```typescript
// ✅ Dynamic import for client-only or heavy components
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@/components/charts/bar-chart'), {
  ssr: false,  // Disable SSR if component uses browser APIs
  loading: () => <div>Loading chart...</div>
});
```

**When to use dynamic imports:**
- Charts and data visualizations
- Rich text editors
- Large third-party libraries
- Components using browser-only APIs

### Database Query Optimization

**Index frequently queried fields:**
```prisma
model Event {
  id         Int      @id @default(autoincrement())
  user_id    Int
  name       String
  created_at DateTime @default(now())

  @@index([user_id])          // Index foreign keys
  @@index([created_at])       // Index sort/filter fields
}
```

**Limit query results:**
```typescript
// ✅ Paginate large datasets
const events = await prisma.event.findMany({
  where: { user_id: userId },
  take: 20,
  skip: page * 20,
  orderBy: { created_at: 'desc' }
});
```

**Select only needed fields:**
```typescript
// ✅ Don't fetch unused data
const eventNames = await prisma.event.findMany({
  select: { id: true, name: true }  // Only fetch what you need
});
```

### Caching Strategies

**Server-side caching (App Router):**
```typescript
// ✅ Cache stable data
import { cache } from 'react';

export const getEventById = cache(async (id: number) => {
  return await prisma.event.findUnique({ where: { id } });
});

// ✅ Revalidate periodically
export const revalidate = 3600;  // 1 hour
```

**Client-side caching:**
- Let Next.js handle fetch caching
- Use React Query/SWR for complex client-side data needs
- Avoid premature optimization - measure first

### Bundle Size Monitoring

**Check bundle impact:**
```bash
# Analyze bundle size
yarn build
# Review .next/analyze output

# Keep an eye on:
# - Client-side bundle < 200KB gzipped
# - Avoid importing entire libraries when you need one function
```

**Tree-shaking friendly imports:**
```typescript
// ❌ Imports entire lodash
import _ from 'lodash';
const result = _.debounce(fn, 100);

// ✅ Import only what you need
import debounce from 'lodash/debounce';
const result = debounce(fn, 100);
```

---

## Testing Strategy

### Test Organization

```
util/__tests__/
  splitPayments.test.ts
  auth.test.ts
lib/__tests__/
  db/
    events.test.ts
    expenses.test.ts
components/__tests__/
  events/
    expense-form.test.tsx
```

### Unit Tests for Business Logic

**Test pure functions thoroughly:**
```typescript
// util/__tests__/splitPayments.test.ts
import { calculateDebts } from '../splitPayments';

describe('splitPayments', () => {
  it('should calculate equal split correctly', () => {
    const expenses = [
      { paymaster_id: 1, amount: 30 }
    ];
    const people = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ];

    const result = calculateDebts(expenses, people);

    expect(result).toEqual([
      { from: 2, to: 1, amount: 10 },
      { from: 3, to: 1, amount: 10 }
    ]);
  });

  it('should handle complex multi-payer scenarios', () => {
    // Test edge cases
  });
});
```

### Integration Tests for API Routes

**Test API endpoints:**
```typescript
// app/api/events/__tests__/route.test.ts
import { POST } from '../route';

describe('POST /api/events', () => {
  it('should create event with valid input', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Event' }),
      headers: { 'Cookie': 'session=valid-token' }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test Event');
  });

  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Event' })
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
```

### Test Coverage Expectations

**Minimum coverage:**
- Business logic (util/, lib/): 80%+
- API routes: 70%+
- Components: 60%+ (focus on logic, not rendering)

**What to test:**
- ✅ Business logic and algorithms
- ✅ API route authorization and validation
- ✅ Database query functions
- ✅ Utility functions
- ✅ Edge cases and error conditions

**What not to over-test:**
- ❌ Prisma queries (trust the ORM)
- ❌ Third-party library behavior
- ❌ Simple React component rendering (unless complex logic)

### Testing Database Queries

**Option 1: Mock Prisma (faster):**
```typescript
import { prismaMock } from '../__mocks__/prisma';

it('should get event by id', async () => {
  prismaMock.event.findUnique.mockResolvedValue({
    id: 1,
    name: 'Test Event',
    user_id: 1
  });

  const event = await getEventById(1);
  expect(event.name).toBe('Test Event');
});
```

**Option 2: Test database (more realistic):**
```typescript
// Setup test database in beforeEach
beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE events CASCADE`;
});

it('should create and retrieve event', async () => {
  const event = await createEvent(userId, 'Test Event');
  const retrieved = await getEventById(event.id);

  expect(retrieved.name).toBe('Test Event');
});
```

**Recommendation:** Mock for unit tests, use test DB for integration tests.

---

## Error Handling

### API Error Response Format

**Standardize error responses:**
```typescript
// types/api.ts
export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

// lib/api/errors.ts
export function errorResponse(
  message: string,
  status: number,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code },
    { status }
  );
}

// Usage in API routes
export async function POST(request: Request) {
  try {
    // ... operation
  } catch (error) {
    console.error('Failed to create event:', error);
    return errorResponse('Internal server error', 500, 'EVENT_CREATE_FAILED');
  }
}
```

### Client-Side Error Boundaries

**Wrap components with error boundaries:**
```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <ExpenseList expenses={expenses} />
</ErrorBoundary>
```

### Logging Strategy

**Structured logging:**
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date() }));
  },
  error: (message: string, error: unknown, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...meta,
      timestamp: new Date()
    }));
  }
};

// Usage
logger.error('Failed to create event', error, { userId, eventName });
```

**What to log:**
- ✅ Server errors (500s)
- ✅ Authentication failures
- ✅ Database errors
- ✅ External API failures
- ❌ Successful requests (too noisy)
- ❌ Sensitive data (passwords, tokens)

### User-Facing Error Messages

**Be helpful but not revealing:**
```typescript
// ❌ Too revealing
return errorResponse('Database connection failed: postgres://user:pass@...', 500);

// ❌ Too vague
return errorResponse('Error', 500);

// ✅ Helpful and secure
return errorResponse('Unable to process your request. Please try again later.', 500);

// ✅ Good for validation errors
return errorResponse('Event name must be between 1 and 100 characters', 400);
```

---

## Code Review Standards

### Review Checklist

**Before requesting review:**
- [ ] All tests pass (`yarn jest`)
- [ ] No lint errors (`yarn lint`)
- [ ] Code is formatted (`yarn format`)
- [ ] No console.logs or debugging code
- [ ] No commented-out code (delete it, git remembers)
- [ ] Environment variables documented in `.env.example`
- [ ] Database migrations created if schema changed
- [ ] CLAUDE.md updated if commands/setup changed

**Reviewer checklist:**
- [ ] Code follows established patterns in codebase
- [ ] No security vulnerabilities (see [Security](#security) section)
- [ ] Error handling is appropriate
- [ ] Types are correctly defined
- [ ] Tests cover important logic paths
- [ ] Performance considerations addressed for data-heavy operations
- [ ] Accessibility considerations for UI changes
- [ ] Breaking changes are documented

### Performance Considerations in Review

**Watch for:**
- N+1 queries in database operations
- Missing indexes on frequently queried fields
- Large client-side bundles (check if component needs 'use client')
- Missing pagination on list endpoints
- Inefficient algorithms (O(n²) when O(n) is possible)

### Security Review Points

**Red flags:**
- User input used directly in queries
- Missing authentication checks on protected routes
- Sensitive data in logs or error messages
- Weak cookie settings (missing httpOnly, secure, sameSite)
- Missing CSRF protection on mutations
- Raw SQL with string interpolation

### Breaking Change Protocol

**If your PR introduces breaking changes:**
1. Label PR with `breaking-change`
2. Document migration path in PR description
3. Update version according to semver
4. Add migration guide to docs
5. Notify team in PR and/or Slack

**Examples of breaking changes:**
- Changing API response format
- Renaming database columns (requires migration)
- Changing authentication mechanism
- Removing API endpoints
- Changing required environment variables

---

## Git Workflow

### Branch Naming Conventions

```
feature/expense-filtering      # New feature
fix/event-deletion-bug         # Bug fix
refactor/database-queries      # Code refactoring
docs/update-readme            # Documentation
chore/upgrade-dependencies    # Maintenance
```

### Commit Message Format

**Use conventional commits:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks (dependencies, config)
- `style`: Code style changes (formatting, missing semicolons)

**Examples:**
```
feat(expenses): add filtering by date range

Implemented date range picker and filter logic for expense list.
Users can now filter expenses by custom date ranges.

Closes #123

---

fix(auth): prevent session token expiry race condition

Added 5-minute buffer to session expiry check to prevent race
condition where token expires between check and database query.

---

refactor(database): split monolithic database.ts into modules

Created lib/db/ directory with separate modules for users, events,
expenses, and people queries. Improves maintainability and reduces
file size from 470 lines to ~100 lines per module.
```

### Pull Request Description Requirements

**PR template:**
```markdown
## Description
Brief description of what this PR does

## Changes
- Bullet list of key changes
- File reorganizations
- New dependencies

## Testing
How to test these changes:
1. Step-by-step instructions
2. Expected behavior

## Screenshots
(if applicable)

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Migrations created (if schema changed)
```

### Merge Strategy

**When to squash:**
- Feature branches with many small "WIP" commits
- Experimental branches with messy history
- Commits that don't follow commit message conventions

**When to merge:**
- Clean commit history with meaningful commits
- Multiple logical changes that should remain separate
- Commits from multiple authors

**When to rebase:**
- Updating feature branch with latest main
- Cleaning up your own branch before review
- **Never** rebase shared branches or published commits

---

## Documentation

### When to Write Comments

**Focus on "why" not "what":**
```typescript
// ❌ BAD - States the obvious
// Loop through expenses
for (const expense of expenses) {
  // Calculate total
  total += expense.amount;
}

// ✅ GOOD - Explains non-obvious logic
// We need to settle debts using minimum transactions algorithm
// to reduce number of payments between participants
const settlements = minimizeTransactions(debts);

// ✅ GOOD - Explains business logic
// Events are soft-deleted to preserve expense history for tax purposes
await prisma.event.update({
  where: { id },
  data: { deleted_at: new Date() }
});
```

**When to comment:**
- ✅ Complex algorithms or business logic
- ✅ Non-obvious workarounds or hacks
- ✅ Performance-critical sections
- ✅ Security considerations
- ✅ TODOs with context
- ❌ Self-explanatory code
- ❌ Redundant descriptions of what the code does

### API Documentation Standards

**Document public API functions:**
```typescript
/**
 * Calculates optimal debt settlements using minimum transactions algorithm.
 *
 * @param expenses - Array of expense records with paymaster and amount
 * @param people - Array of participants in the event
 * @returns Array of debt transfers with from/to/amount
 *
 * @example
 * const settlements = calculateDebts(
 *   [{ paymaster_id: 1, amount: 30 }],
 *   [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
 * );
 * // Returns: [{ from: 2, to: 1, amount: 15 }]
 */
export function calculateDebts(
  expenses: Expense[],
  people: Person[]
): DebtTransfer[] {
  // Implementation
}
```

### Keeping CLAUDE.md Updated

**Update CLAUDE.md when:**
- Adding new commands or scripts
- Changing development setup process
- Adding new environment variables
- Changing project structure significantly
- Adding new development tools or dependencies

### README Updates for New Features

**For user-facing features:**
- Add to features list
- Include screenshots if UI change
- Update getting started guide if affects onboarding
- Document any new configuration options

**For developer features:**
- Update Commands section
- Add to Architecture section if structural change
- Document in Local Development Setup if affects setup

---

## Project-Specific Patterns

### Cookie-Based Session Auth

**Current implementation:**
```typescript
// Session token stored in httpOnly cookie
// 24-hour expiry
// Validated on each protected request
// CSRF protection with token generation

// Follow this pattern for all protected routes
const sessionToken = cookies().get('session')?.value;
const user = await getUserByValidSessionToken(sessionToken);
```

### Prisma v7 Driver Adapters

**Connection pattern:**
```typescript
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });
```

### Emotion CSS-in-JS Patterns

**Consistent styling approach:**
```typescript
import { css } from '@emotion/react';

// ✅ Define styles at module level
const containerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
`;

// ✅ Use in component
export function EventCard() {
  return <div css={containerStyles}>Content</div>;
}
```

### Docker-Based Local PostgreSQL

**Standard commands:**
```bash
yarn db:up      # Start PostgreSQL
yarn db:down    # Stop PostgreSQL (data persists)
yarn db:reset   # Reset database (WARNING: deletes data)
```

**Connection defaults:**
- Host: localhost
- Port: 5432
- Database: splitify
- User: splitify
- Password: splitify_dev

### Split Payments Algorithm

**Core business logic:**
```typescript
// util/splitPayments.ts
// Uses minimum transactions algorithm
// Calculates who owes what to whom
// Optimizes for fewest payment transactions

// DO NOT change without thorough testing
// See util/__tests__/splitPayments.test.ts
```

---

## Migration Context Notes

### App Router Migration (95% Complete)

**Current status:**
- Most pages migrated to App Router
- Server Components for data fetching implemented
- Client Components properly marked with 'use client'
- Route structure corrected (`/events/:id` not `/users/:id`)

**Known issue:**
- Build error: `TypeError: f.createContext is not a function`
- Likely related to SSR with chart.js or Emotion
- Workaround: May need dynamic imports for chart components

**During transition:**
- Some patterns may exist in both Pages and App Router styles
- Prefer App Router patterns for new code
- See MEMORY.md for detailed migration notes

---

## Appendix: Quick Reference

### Pre-Commit Checklist
```bash
yarn lint           # No errors
yarn format         # Code formatted
yarn jest           # Tests pass
git status          # Only intended changes
```

### Common Code Smells
- Files > 300 lines → Split into modules
- Functions > 50 lines → Extract helpers
- Duplicate code → Create utility function
- Deep nesting (>3 levels) → Extract functions or early returns
- Long parameter lists → Use options object
- Magic numbers → Define as named constants

### Performance Red Flags
- Multiple database queries in a loop → Use include or batch query
- Large bundle size → Check dynamic imports
- Slow page loads → Check Server Component data fetching
- Memory leaks → Check useEffect cleanup
- Unnecessary re-renders → Check React.memo usage

### Security Red Flags
- User input in queries → Verify Prisma parameterization
- Missing auth checks → Add session validation
- Sensitive data in logs → Remove or redact
- Weak cookies → Check httpOnly/secure/sameSite
- CSRF vulnerability → Verify token validation

---

**Document Version:** 1.0
**Maintained by:** Engineering Team
**Review Cadence:** Quarterly or as needed
