# Technical Criteria for Test Creation

**Story:** RWA-142 · Send money to a contact  
**Author:** Anastasia Smorodin  
**Date:** 2026-07-07

---

## 1. Selectors / Test IDs

### Existing `data-test` attributes (verified in source)

| Element | Selector | Location |
|---------|----------|----------|
| Sign In — username input | `[data-test="signin-username"]` | SignInForm.tsx |
| Sign In — password input | `[data-test="signin-password"]` | SignInForm.tsx |
| Sign In — submit button | `[data-test="signin-submit"]` | SignInForm.tsx |
| Sign In — error alert | `[data-test="signin-error"]` | SignInForm.tsx |
| Sign In — remember me | `[data-test="signin-remember-me"]` | SignInForm.tsx |
| Nav — New Transaction button | `[data-test="nav-top-new-transaction"]` | NavBar.tsx |
| Nav — Notifications link | `[data-test="nav-top-notifications-link"]` | NavBar.tsx |
| Nav — Notifications count | `[data-test="nav-top-notifications-count"]` | NavBar.tsx |
| User search input | `[data-test="user-list-search-input"]` | UserListSearchForm.tsx |
| User list item | `[data-test="user-list-item-{userId}"]` | UserListItem.tsx |
| Transaction form | `[data-test="transaction-create-form"]` | TransactionCreateStepTwo.tsx |
| Amount input | `[data-test="transaction-create-amount-input"]` | TransactionCreateStepTwo.tsx |
| Note/description input | `[data-test="transaction-create-description-input"]` | TransactionCreateStepTwo.tsx |
| Pay button | `[data-test="transaction-create-submit-payment"]` | TransactionCreateStepTwo.tsx |
| Request button | `[data-test="transaction-create-submit-request"]` | TransactionCreateStepTwo.tsx |
| Return to Transactions | `[data-test="new-transaction-return-to-transactions"]` | TransactionCreateStepThree.tsx |
| Create Another | `[data-test="new-transaction-create-another-transaction"]` | TransactionCreateStepThree.tsx |
| Tab — Everyone | `[data-test="nav-public-tab"]` | TransactionNavTabs.tsx |
| Tab — Friends | `[data-test="nav-contacts-tab"]` | TransactionNavTabs.tsx |
| Tab — Mine | `[data-test="nav-personal-tab"]` | TransactionNavTabs.tsx |
| Transaction item | `[data-test="transaction-item-{txId}"]` | TransactionItem.tsx |
| Transaction amount | `[data-test="transaction-amount-{txId}"]` | TransactionAmount.tsx |
| Notifications list | `[data-test="notifications-list"]` | NotificationList.tsx |
| Bank account list | `[data-test="bankaccount-list"]` | BankAccountList.tsx |
| Sidenav — username | `[data-test="sidenav-username"]` | NavDrawer.tsx |
| Sidenav — Bank Accounts | `[data-test="sidenav-bankaccounts"]` | NavDrawer.tsx |
| Alert bar | `[data-test="alert-bar-{severity}"]` | AlertBar.tsx |

### Missing selectors — propose adding

| Proposed Selector | Element | Reason |
|-------------------|---------|--------|
| `data-test="transaction-confirmation-message"` | Confirmation text on Step 3 | Need to assert "Paid" message content |
| `data-test="transaction-confirmation-amount"` | Amount on confirmation screen | Verify payment amount on success |
| `data-test="transaction-confirmation-recipient"` | Recipient name on confirmation | Verify correct recipient |
| `data-test="user-onboarding-bankaccount-prompt"` | Bank account required modal/message | Assert error state for users without bank |
| `data-test="transaction-sender-name"` | Sender name on transaction detail | Needed for receiver-side assertions |
| `data-test="nav-top-logout"` | Logout button/link | Reliable logout automation |

---

## 2. API Endpoints & Contracts

### `POST /login`
```
Request:
  POST http://localhost:3001/login
  Content-Type: application/json
  Body: { "username": "Heath93", "password": "s3cret" }

Response (200):
  Set-Cookie: connect.sid=...
  Body: { "user": { "id": "...", "username": "Heath93", ... } }

Response (401):
  Body: { "errors": [...] } or passport error message
```

**What to verify at API layer:**
- 200 on valid credentials + session cookie set
- 401 on invalid credentials
- No password in response body

### `POST /transactions`
```
Request:
  POST http://localhost:3001/transactions
  Content-Type: application/json
  Cookie: connect.sid=...
  Body: {
    "transactionType": "payment",
    "amount": 2500,  // cents
    "description": "Lunch yesterday",
    "senderId": "<sender-uuid>",
    "receiverId": "<receiver-uuid>"
  }

Response (200):
  Body: { "transaction": { "id": "...", "status": "complete", ... } }
```

**What to verify at API layer:**
- 200 on valid payload + transaction created
- 401 if not authenticated
- 422 if amount missing/invalid
- Transaction appears in sender's GET /transactions
- Notification created for receiver (GET /notifications)

### `GET /transactions` (scoped to user)
- Verify transaction appears in results after creation
- Pagination works correctly

### `GET /notifications`
- Verify receiver has notification for received payment

---

## 3. Test Data Strategy

### Seeding
- Use `yarn db:seed:dev` before each test run (or suite) to reset to known state
- The seed file (`data/database-seed.json`) provides 5 users, all with password `s3cret`
- Known users: `Heath93`, `Arvilla_Hegmann`, `Dina20`, `Reyes.Osinski`, `Judah_Dietrich50`

### Deterministic test data
- **Sender:** `Heath93` (has linked bank account in seed data)
- **Receiver:** `Arvilla_Hegmann`
- **Third-party viewer:** `Dina20`
- **Amount:** Use unique amounts per test (e.g., $25.00, $10.50) to identify transactions in feed

### State reset between tests
- Copy `database-seed.json` → `database.json` before each test file or use API-based cleanup
- Each test should be independently runnable — no dependency on test execution order
- For Playwright: use `beforeAll` or `beforeEach` hooks to seed

### Cross-test contamination prevention
- Never share login sessions across tests (fresh login per test)
- Use unique amounts/notes to disambiguate transactions in feeds
- Reset database between test files to prevent accumulated state

---

## 4. Reliability & Flake Observations

| Risk | Mitigation |
|------|------------|
| **User list search debounce** — search results may take time to appear | Wait for `[data-test^="user-list-item-"]` to appear after typing, not a fixed timeout |
| **Transaction submission animation** — confirmation screen may animate in | Wait for `[data-test="new-transaction-return-to-transactions"]` to be visible |
| **Feed not immediately updated** — new transaction may not appear instantly | After payment, wait for network idle or poll the personal feed tab |
| **Shared database file** — concurrent test runs corrupt state | Run tests serially (no parallel workers sharing the same db file) |
| **Form validation timing** — Formik validates on mount and async | Assert button disabled state after waiting for validation to complete |
| **Alert/snackbar auto-dismiss** — success messages may disappear | Assert immediately after action, or increase snackbar timeout in test env |
| **API cold start** — first request after `yarn dev` may be slow | Add reasonable timeout for first navigation (10s) |

### Recommended waits
- Use `waitForSelector` / Playwright's auto-waiting rather than `sleep()`
- Wait for network idle after form submissions
- Use `toBeDisabled()` / `toBeEnabled()` assertions with built-in retry

---

## 5. Tooling Choice

### **Playwright** (chosen)

**Why:**
1. **Auto-waiting** — built-in intelligent waiting reduces flake without manual sleeps
2. **Multi-browser** — can test Chromium, Firefox, WebKit with zero config
3. **API testing built-in** — `request` context for API-layer assertions without a separate tool
4. **Screenshot capture** — first-class `page.screenshot()` API for evidence
5. **Test isolation** — each test gets its own browser context (no shared cookies/state)
6. **TypeScript support** — matches the app's language for consistency
7. **CI-friendly** — works well in GitHub Actions with minimal config
8. **Network interception** — can mock/intercept for edge cases (e.g., simulating network failure)

**Configuration:**
- Base URL: `http://localhost:3000`
- API URL: `http://localhost:3001`
- Screenshot on every step (manual captures) + on failure (automatic)
- Single worker to avoid database conflicts
- Timeout: 30s per test, 10s per action
