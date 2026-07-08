# e2e — End-to-end Automated Tests

## Tool: Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- The app running locally (`yarn dev`)

## Setup

```bash
# From the project root — install app dependencies
nvm use
yarn install

# Install e2e test dependencies
cd e2e
npm install

# Install browser (Chromium)
npx playwright install chromium
```

## Running the Tests

```bash
# From the project root:
# 1. Start the app (in one terminal)
yarn dev

# 2. Reset the database to known state
yarn db:seed:dev

# 3. Run e2e tests (in another terminal)
yarn test:e2e
```

Or from the `e2e/` folder directly:
```bash
npx playwright test
```

## Test Structure

```
e2e/
├── playwright.config.ts              # Playwright configuration
├── tests/
│   ├── send-money-happy-path.spec.ts # TC-142-01: Full login → send money journey
│   ├── sign-in-edge-cases.spec.ts    # TC-118: Sign-in validation & errors
│   ├── send-money-edge-cases.spec.ts # TC-142-03 to 07: Amount/note validation (bugs)
│   └── advanced-edge-cases.spec.ts   # TC-142-11+: Multi-user, auth, boundaries
├── screenshots/                      # Captured at each meaningful step (34 images)
└── package.json
```

## Screenshots

Screenshots are captured at each step and saved to `e2e/screenshots/`. They serve as visual evidence of test execution.

## Known Failing Tests (Intentional — Bug Documentation)

The following tests are expected to **FAIL** because they document real bugs:

1. **TC-142-04** — Zero amount should disable Pay button (AC3 violated: `number().required()` without `.positive()`)
2. **TC-142-05** — Negative amount should disable Pay button (AC3 violated: `allowNegative={true}`)
3. **TC-142-07** — Note field should be optional (AC5 violated: `description.required()`)

These failing tests are kept intentionally — they are **the evidence** that the app doesn't match the acceptance criteria. See `instructions/submission/bug-report.md` for full details and root cause.

## Configuration

- **Base URL:** `http://localhost:3000`
- **Browser:** Chromium (headless)
- **Workers:** 1 (serial execution — shared database file)
- **Timeout:** 60s per test
- **Retries:** 0 (deterministic tests should not need retries)

