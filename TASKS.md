# Splitify — Feature Ideas

Analysis of the current codebase and suggestions for new features, organized by impact and effort.

---

## Current Features (Baseline)

| Area         | What exists                                  |
| ------------ | -------------------------------------------- |
| Auth         | Register, login, cookie sessions, CSRF       |
| Events       | Create, delete, image upload (Cloudinary)    |
| Participants | Add/remove people                            |
| Expenses     | Log expense, assign paymaster + participants |
| Settlement   | Minimum-transaction algorithm, bar chart     |

---

## Proposed Features

### High Impact — Core UX Gaps

#### 1. Expense Categories & Tags

Expenses have a name and cost, nothing else. Adding categories (food, transport, accommodation, entertainment, etc.) would let users filter expenses and see a per-category breakdown chart.

- **Schema change:** Add `category` field to `expenses` table
- **UI change:** Category dropdown in expense form; filter/group in `ExpenseList.tsx`
- **Visualization:** Pie or donut chart by category alongside the existing bar chart

---

#### 2. Unequal Splits

The app tracks who participated but treats all shares as equal. Many real-world scenarios need splits by exact amount, percentage, or custom weight.

- **Schema change:** Add `share_amount` (Int, cents) column on `expense_participants`
- **Logic change:** Update `expenseBalances.ts` to use `share_amount` instead of equal division
- **UI change:** Per-person amount/percentage input in expense form

---

#### 3. Expense Editing

There is no edit flow — users can only delete and re-add. A PATCH endpoint and edit form would cover a very common action.

- **API change:** Add PATCH handler to `api/expense.ts`
- **UI change:** Edit button + inline form in `ExpenseList.tsx`
- **Tests:** Update `api/__tests__/expense.test.ts`

---

#### 4. Event Sharing / Inviting Others

Events are private to their creator (`user_id` ownership). There is no way to let other registered users co-manage an event.

- **Schema change:** Add `event_members` join table (`event_id`, `user_id`, `role`)
- **API change:** Invite-by-username endpoint
- **UI change:** Member management section on the event page

---

### Medium Impact — Usability Improvements

#### 5. Currency Selection Per Event

Costs are stored in cents but always displayed as euros. A `currency` field on `events` and `Intl.NumberFormat` for display would make the app internationally useful with minimal schema work.

- **Schema change:** Add `currency` (String, e.g. `"EUR"`) to `events`
- **UI change:** Currency selector when creating an event; pass currency to all display components

---

#### 6. Settlement History / Mark Payments as Done

The settlement screen shows who owes whom, but there is no way to record that a debt was actually repaid.

- **Schema change:** Add `settlements` table (`id`, `event_id`, `from_person_id`, `to_person_id`, `amount`, `settled_at`)
- **API change:** POST endpoint to record a settlement
- **UI change:** "Mark as paid" button on each suggested payment; settled debts shown with strikethrough

---

#### 7. Recurring Expenses

For long-running events (shared housing, ongoing trips), users often have repeating costs.

- **Quick version:** "Duplicate expense" button — copies name, cost, paymaster, and participants
- **Full version:** `recurrence_rule` field on `expenses`; cron job or on-load generation

---

#### 8. Export to PDF / CSV

Let users download a full summary of event expenses and the settlement plan.

- **API change:** GET `/api/export?eventId=X&format=csv|pdf` endpoint
- **Libraries:** `jsPDF` for PDF or plain CSV serialization
- **UI change:** Export button on the event page

---

### Lower Effort — Quick Wins

#### 9. Event Archiving

Replace hard-delete with soft-delete so historical events are preserved.

- **Schema change:** Add `archived_at` (DateTime, nullable) to `events`
- **UI change:** "Archive" button instead of delete; toggle to show archived events

---

#### 10. Expense Search & Date Tracking

Add timestamps to expenses and a search/filter input on the event page.

- **Schema change:** Add `created_at DateTime @default(now())` to `expenses`
- **UI change:** Search bar filtering by expense name; date range picker

---

#### 11. Participant Avatars / Colors

Assign a consistent color per person across the bar chart and lists for easier visual scanning.

- **Schema change:** Add `color` (String, hex) to `people`, generated on creation
- **UI change:** Color dot next to each person's name; bar chart uses per-person colors

---

#### 12. Summary Email on Event Close

When a user closes an event, send an email with the final settlement summary.

- **Schema change:** Add `email` field to `users`; add `closed_at` to `events`
- **API change:** POST `/api/event/close` triggers email via Resend or Nodemailer
- **UI change:** "Close event" button with confirmation dialog

---

## Recommended Starting Points

If prioritizing by effort-to-value ratio:

| Priority | Feature                 | Why                                       |
| -------- | ----------------------- | ----------------------------------------- |
| 1        | Expense editing (#3)    | Lowest effort, high daily-use value       |
| 2        | Currency selection (#5) | Trivial schema change, immediately useful |
| 3        | Settlement marking (#6) | Closes the loop on the app's core purpose |
