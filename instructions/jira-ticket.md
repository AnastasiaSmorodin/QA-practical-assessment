# RWA-142 · Send money to a contact

**Type:** Story  **Epic:** Transactions  **Priority:** High  **Story Points:** 5
**Components:** Web App, Transactions API  **Labels:** payments, p2p-transfer

## Story

**As a** logged-in user with a linked bank account
**I want** to send money to another user with an amount and a note
**So that** I can pay people back and the payment shows up in our transaction history and notifications.

## Description

From the home screen, a user starts a new transaction, searches for a contact, enters a payment amount and an optional note, and confirms with **Pay**. The transaction is created as a _payment_, the sender's and receiver's balances reflect the transfer, the receiver gets a notification, and the transaction appears in the relevant activity feeds (Mine, Friends, and — if public — Everyone). This story covers the **Pay** path only; "Request money" is tracked separately (RWA-143).

## Preconditions

- User is authenticated.
- User has at least one bank account linked (onboarding complete).
- At least one other user exists to receive the payment.

## Acceptance Criteria

### AC1 — Happy path: send a payment

```gherkin
Given I am logged in and have a linked bank account
And I am on the home screen
When I click "New"
And I search for and select a contact
And I enter a valid amount of "$25.00"
And I enter the note "Lunch yesterday"
And I click "Pay"
Then I see a confirmation screen for the completed payment
And the transaction appears at the top of my "Mine" feed
And the note "Lunch yesterday" and amount "$25.00" are displayed on the transaction
```

### AC2 — Receiver is notified and sees the transaction

```gherkin
Given I have sent a payment of "$25.00" to another user
When the receiver logs in
Then the receiver has a new notification for the received payment
And the transaction appears in the receiver's "Mine" feed
And the amount is shown as a credit (incoming) for the receiver
```

### AC3 — Amount validation

```gherkin
Given I am on the payment amount step
When I enter "0", a negative value, or leave the amount empty
Then the "Pay" button is disabled
And I cannot proceed until a valid positive amount is entered
```

### AC4 — Contact is required

```gherkin
Given I have started a new transaction
When I have not selected a contact
Then I cannot reach the amount/note step
```

### AC5 — Note is optional

```gherkin
Given I have selected a contact and entered a valid amount
When I leave the note field empty
And I click "Pay"
Then the payment completes successfully with no note
```

### AC6 — Feed privacy

```gherkin
Given a payment between two users has completed
When a third, unrelated user views the "Everyone" (public) feed
Then they see the transaction without the exact amount exposed per privacy rules
And the payment is not shown in the third user's "Mine" or "Friends" feed
```

## Out of scope

- Requesting money (RWA-143)
- Splitting a payment across multiple users
- Editing or canceling a completed payment

## Definition of Done

- [ ] Code merged and deployed to staging
- [ ] AC1–AC6 verified
- [ ] Automated coverage added (UI happy path + API contract for `POST /transactions`)
- [ ] No regression in transaction feeds or notifications
- [ ] Accessibility: amount/note inputs and Pay button are keyboard-navigable and labeled

---

## QA Annotations

*Added by: Anastasia Smorodin — 2026-07-07*

### AC1 — Happy path: send a payment

- **[QA: High risk — money movement, prioritize]**
- **Test type:** Automated UI (E2E) + API contract test
- **Data dependencies:** Seeded user `Heath93` with linked bank account; recipient `Arvilla_Hegmann` exists; database freshly seeded
- **Observations:**
  - "Confirmation screen" is vague — need a `data-test` attribute on the confirmation message (propose: `data-test="transaction-confirmation-message"`)
  - "Appears at the top of my Mine feed" — timing-dependent; need to wait for feed refresh
  - Verify both UI confirmation AND `POST /transactions` response returns `200` with transaction object
  - Use `[data-test="nav-top-new-transaction"]` → `[data-test="user-list-search-input"]` → `[data-test="transaction-create-amount-input"]` → `[data-test="transaction-create-submit-payment"]` flow

### AC2 — Receiver is notified and sees the transaction

- **[QA: High risk — data integrity across users]**
- **Test type:** Automated UI (multi-user session) + API verification
- **Data dependencies:** Requires completed transaction from AC1; receiver account `Arvilla_Hegmann`
- **Observations:**
  - Requires multi-user test: logout sender → login receiver → check notifications
  - "Credit (incoming)" — no clear visual spec. Verify via `[data-test="transaction-amount-{id}"]` text contains "+" or is styled differently
  - API-layer alternative: `GET /notifications` for receiver should list payment notification
  - Can verify at API layer more reliably than UI (faster, no multi-login needed)

### AC3 — Amount validation

- **[QA: High risk — prevents invalid money movement]**
- **Test type:** Automated UI + unit test on Yup validation schema
- **Data dependencies:** User logged in, contact selected, on step 2 form
- **Observations:**
  - ⚠️ **BUG FOUND:** The NumberFormat component has `allowNegative={true}` — negative values are NOT blocked by the input mask
  - ⚠️ **BUG FOUND:** The Yup schema only validates `number().required()` — it does NOT enforce `min(0)` or positive-only
  - The "Pay" button disables based on Formik's `isValid` — negative values will pass validation and enable the button
  - Both "Pay" AND "Request" buttons share the same `!isValid` logic but AC only mentions "Pay"
  - Selectors: `[data-test="transaction-create-submit-payment"]` for button state assertion

### AC4 — Contact is required

- **[QA: Medium risk — flow gating]**
- **Test type:** Automated UI
- **Data dependencies:** User logged in
- **Observations:**
  - The UI is step-based (Step 1: select contact → Step 2: amount/note) — contact selection gates progression
  - Verify that `[data-test="transaction-create-form"]` does NOT exist until a user is selected
  - The user list items use `[data-test="user-list-item-{userId}"]` — clicking one advances the step
  - No explicit "skip" or "next" button exists without selection — this is enforced by UX flow

### AC5 — Note is optional

- **[QA: High risk — directly contradicts implementation]**
- **Test type:** Automated UI (expected FAIL)
- **Data dependencies:** User logged in, contact selected, valid amount entered
- **Observations:**
  - ⚠️ **BUG FOUND:** `src/components/TransactionCreateStepTwo.tsx` line 37: `description: string().required("Please enter a note")` — the note is REQUIRED by the validation schema
  - The `<TextField>` for description also has `required` HTML attribute (line 160)
  - Submitting with empty note will fail Formik validation → Pay button stays disabled
  - **This is a spec-vs-implementation defect** — file bug report
  - Selector: `[data-test="transaction-create-description-input"]`

### AC6 — Feed privacy

- **[QA: Medium risk — privacy/compliance]**
- **Test type:** Automated UI (multi-user) or API
- **Data dependencies:** Completed transaction between two users; third user (`Dina20`) not in their contacts
- **Observations:**
  - "Privacy rules" are not defined in the story — need clarification from Product
  - Verify at API layer: `GET /transactions/public` should NOT expose amount to unrelated users
  - UI: check `[data-test="nav-public-tab"]` feed for transaction visibility
  - Verify transaction does NOT appear in third user's `[data-test="nav-personal-tab"]` or `[data-test="nav-contacts-tab"]`
  - Need to clarify: is the amount hidden entirely, or shown as a range, or replaced with "paid"?

### General QA Notes

- **Database reset:** Run `yarn db:seed:dev` before each test suite to ensure deterministic state
- **Parallel test risk:** The app uses a single JSON file as database — tests must run serially
- **Missing test IDs needed:** Confirmation screen elements (Step 3) lack specific data-test attributes for amount/message assertion
- **API-first approach recommended for AC2 and AC6:** Multi-user UI tests are slow and flaky; API verification is faster and more reliable for cross-user assertions
