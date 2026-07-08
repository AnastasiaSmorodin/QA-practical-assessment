# Senior Quality Engineer — Practical Assessment

Welcome, and thanks for taking the time. This exercise is designed to mirror how we actually work: **quality starts before code is written.** We care less about how many test cases you can produce and more about how you think — how you pressure-test requirements, communicate with the team, and set up automation to be reliable and low-maintenance.

You will work against one of the provided Jira stories for this application (a Venmo-style peer-to-peer payments app).

> **Tools & AI — use whatever helps you.** You're free to use any tools you like to complete this assessment, including AI assistants (ChatGPT, Claude, Copilot, Cursor, AI-powered QA tools, etc.). We use these tools too. The only ask: **if you use AI, include a short `AI-USAGE.md` in your fork** explaining *how* and *where* you used it (e.g. "generated the first draft of the Playwright spec," "drafted the bug report wording," "brainstormed edge cases"). We're interested in your judgment about when to lean on AI and how you verify its output — not in whether you used it.

---

## The app under test

A payments app where users sign in, link a bank account, send/request money, comment/like transactions, and receive notifications.

Run it locally:

```bash
nvm use        # uses the repo's Node version (see .nvmrc)
yarn install
yarn dev       # http://localhost:3000 (frontend), http://localhost:3001 (API)
```

- Log in with a seeded user — password is `s3cret` for all of them. Run `yarn list:dev:users` to list usernames, or click **Sign Up** to create your own account.
- Reset data anytime with `yarn db:seed:dev`. Start from an empty database with `yarn start:empty`.
- The codebase already uses `data-test="..."` attributes as automation hooks (e.g. `data-test="signin-username"`). Treat this as the existing selector convention.

## Your stories

Pick **one** of the following (or do both if you have time — call out which you focused on):

- `instructions/jira-ticket.md` — **RWA-142 · Send money to a contact**
- `instructions/jira-ticket-auth.md` — **RWA-118 · Sign in with username and password**

---

## What we want you to deliver

Do these **in order** — the sequence is the point. We want to see you engage with the story _before_ you start building tests.

### 1. Story feedback (shift-left review) — do this first

Before writing any test, review the story as if you were in backlog refinement. In a short writeup, tell us:

- **Ambiguities & gaps** — what is unclear, missing, or assumed? (e.g. undefined limits, missing error states, currency/rounding rules, concurrency, permissions)
- **Untestable or weak acceptance criteria** — which ACs can't be objectively verified as written, and how would you rewrite them?
- **Missing scenarios** — edge cases, negative paths, and risks the story doesn't cover.
- **Questions for Product/Design/Eng** — the actual questions you'd ask to agree on "done" before development starts.
- **A recommendation** — is this story ready to be worked on? If not, what has to change first?

> This is the most important section. We're hiring someone who prevents bugs by improving the story, not just someone who finds them later.

### 2. QA annotations on the story

Annotate the story **directly inside the story's own `.md` file** (`instructions/jira-ticket.md` or `instructions/jira-ticket-auth.md`). Add a new section at the bottom titled **`## QA Annotations`** and mark up each acceptance criterion with notes such as:

- **Risk / priority** (e.g. `[QA: High risk — money movement, prioritize]`)
- **Test type** it implies (manual, automated UI, API, contract, accessibility)
- **Data dependencies** (what state/users/accounts must exist first)
- **Observations** — anything ambiguous, anything that needs a test ID, anything you'd verify at the API layer instead of the UI.

Keep your annotations in that `QA Annotations` section so the story and its QA notes live together in one file.

### 3. Manual test script

Write a manual test script for the story that another QA could execute with no extra context. For each test case include:

- ID and title (e.g. `TC-142-01 · Send a valid payment`)
- Preconditions and required test data (which user, account, amounts)
- Numbered steps
- Expected result per step / overall
- Priority and whether it's a candidate for automation

Cover the happy path, negative paths, validation, and at least one edge case you identified in step 1.

### 4. Technical criteria for test creation

This is where you set up the automation to be trustworthy. Document the technical groundwork a test would need, including:

- **Selectors / test IDs** — the specific `data-test` attributes (or other stable selectors) the tests should use. **Where they're missing, propose the exact attribute and element** you'd ask engineering to add (e.g. `data-test="transaction-create-amount-input"`), rather than relying on brittle text/CSS selectors.
- **API endpoints & contracts** — which calls the flow depends on (e.g. `POST /transactions`, `POST /login`), the request/response shape you'd assert on, and what you'd verify at the API layer vs. the UI.
- **Test data strategy** — how you'd create/seed/reset state deterministically (seeding, API setup, factories), and how you'd avoid cross-test contamination.
- **Reliability & flake observations** — timing/async waits, animations, shared state, anything you'd guard against to keep a green build trustworthy.
- **Tooling choice** — which test tool(s) you'd use and why (your choice — Playwright, Cypress, Selenium, Postman, etc.).

### 5. Automated tests (required)

Build automated coverage for the end-to-end journey. **Use any tool you like** — Playwright, Cypress, Selenium, WebdriverIO, a hybrid UI+API approach, or anything else. We care about the quality and reliability of the tests, not the brand. Nothing is pre-installed — add and configure your tool as part of your submission.

**Where it goes:** put your tests in the **`e2e/` folder at the project root**, and wire them to the `test:e2e` script in `package.json` so the suite runs with:

```bash
yarn test:e2e
```

(That script currently exits with a placeholder message — replace it with your runner's command. See `e2e/README.md`.)

Implement it in this order:

1. **Happy path first — full flow from login to sending money.** A single end-to-end journey that:
   - signs in as a user,
   - navigates to start a new transaction,
   - selects a contact, enters a valid amount and note,
   - sends the payment (Pay), and
   - asserts the payment succeeded (confirmation + the transaction appears in the feed).

   This deliberately spans both stories (RWA-118 sign-in → RWA-142 send money) so we can see how you handle a realistic user journey, not just isolated steps.

2. **Then the edge cases and failure paths.** Once the happy path is green, add negative/edge coverage, for example:
   - invalid login credentials (no session, error shown),
   - sign-in field validation (empty username, password too short),
   - send-money validation (zero/negative/empty amount, no contact selected),
   - sending without a linked bank account / other failure states you identified in section 1.

**Screenshots as evidence:** the tests must **capture a screenshot at each meaningful step** (e.g. sign-in page, after login, new-transaction form, amount entered, payment confirmation, and each failure/edge state). Save them into the repo (e.g. `e2e/screenshots/`) so the run produces visual evidence of what happened at every step. These screenshots are part of the expected deliverable.

Guidance:

- Get the happy path passing and committed **before** layering in the edge cases.
- Use stable selectors (the existing `data-test` convention); if you add the missing test IDs from section 4 to the app to make a test reliable, that's encouraged — note what you changed.
- Make tests deterministic and independently runnable (seed/reset data; don't depend on test execution order).
- Keep the suite trustworthy: a green run should mean the flow genuinely works.

Include a short **README** with the exact commands to install and run your tests.

### Bonus (optional) — CI workflow

If you have time, add a **GitHub Actions workflow** (`.github/workflows/e2e.yml`) that runs your e2e suite automatically and **fails the build when any test fails**. A good submission would:

- trigger on pull requests (and/or pushes),
- install dependencies and use the repo's Node version (`.nvmrc`),
- start the app (or let your test runner start it),
- run `yarn test:e2e`, with the job failing on a non-zero exit,
- optionally upload reports/screenshots as artifacts.

This is a nice-to-have — it tells us how you think about making a green build the gate for shipping. Don't sacrifice the core deliverables for it.

### 6. Report a bug

The application **does not fully match the acceptance criteria** — at least one AC is implemented incorrectly. As you build your edge-case tests, one or more of them should **fail against the real behavior**. That's expected.

When that happens, **do not weaken the test or change the acceptance criterion to make it pass.** A failing test that reflects a real gap between the spec and the product is exactly what we want to see. Instead:

1. Confirm it's a genuine product defect (reproduce it manually).
2. Keep the failing automated test in your suite (it documents the defect).
3. **File a bug ticket** as `instructions/submission/bug-report.md` using the template below.
4. Capture a **screenshot** showing the incorrect behavior as evidence.

**Bug ticket template:**

```markdown
# BUG: <short summary>

**Severity:** Critical / High / Medium / Low
**Priority:** P1 / P2 / P3
**Affected story / AC:** e.g. RWA-142 · AC3
**Environment:** local — commit <sha>, browser <name+version>, Node <version>

## Steps to reproduce
1. ...
2. ...

## Expected result
(What the acceptance criterion says should happen.)

## Actual result
(What the app actually does.)

## Evidence
(Link/path to screenshot(s); failing test name.)

## Impact / notes
(Why it matters — e.g. data integrity, money movement — and any root-cause observation.)
```

We're looking for: a clear, reproducible report; correct severity/priority judgment (think about what an incorrectly-handled amount means for a payments app); and good evidence. Bonus if you point at a likely root cause.

---

## Deliverables

**Submit a fork of this repository** with all your changes committed. Share the link to your fork when you're done. Your fork should contain:

1. **Automated tests** in the **`e2e/` folder** at the project root, runnable via `yarn test:e2e`, with a short README covering install/run commands (see `e2e/README.md`).
2. **Screenshots as evidence** of each step (happy path + edge/fail states), committed into the repo (e.g. `e2e/screenshots/`).
3. **The GitHub Actions workflow working**, if you attempt the bonus — the run should be visible (green/red) in the Actions tab of your fork.
4. **Story analysis written into the story file itself** — your `## QA Annotations` section inside `instructions/jira-ticket.md` (or `jira-ticket-auth.md`).
5. A **bug ticket** at `instructions/submission/bug-report.md` for the defect your tests uncover (see section 6).
6. The supporting writeups under `instructions/submission/`:
   - `01-story-feedback.md`
   - `02-manual-test-script.md`
   - `03-technical-criteria.md`

A short top-level note tying it all together is welcome. **If you used AI tools, also include `AI-USAGE.md`** describing how and where (see the note at the top).

## Time box

Aim for **3–4 hours**. We are not looking for exhaustive coverage; we're looking for sharp judgment plus a working end-to-end test. If you run short on time, make sure you deliver: (1) the story feedback and (2) a **passing happy-path automated test from login to sending money**. Then add edge cases and the remaining writeups, noting what you'd do with more time.

## How we evaluate

| Area | What "great" looks like |
|------|-------------------------|
| **Shift-left thinking** | Catches real ambiguities; asks the questions that prevent rework; has a clear "ready / not ready" call |
| **Testability** | Rewrites weak ACs into objective, verifiable statements |
| **Coverage & risk** | Prioritizes by risk (money movement, auth, data integrity); covers negative/edge cases, not just happy path |
| **Automation foundations** | Specifies stable selectors, proposes missing test IDs, picks the right layer (API vs UI), plans deterministic data |
| **Working automation** | The happy-path login→send-money test runs green and is readable; edge/fail paths are added on top; suite is deterministic and independently runnable; step-by-step screenshots are captured as evidence |
| **Defect reporting** | Spots the spec-vs-behavior gap, keeps the failing test rather than masking it, files a clear reproducible bug with the right severity and evidence |
| **Reliability mindset** | Anticipates flake and designs against it |
| **Communication** | Clear, concise, and written for the team to act on |

Questions are welcome — asking good ones is part of the job. Good luck!
