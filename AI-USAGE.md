# AI Usage Disclosure

## Tools Used

- **GitHub Copilot** — inline code suggestions while writing Playwright tests
- **Claude (via Copilot CLI)** — exploratory research, document drafting, code generation

## Where and How

### Source code exploration
I used AI to search the codebase for `data-test` attributes, API routes, and validation logic. This was faster than grepping manually through dozens of files, but I verified every selector against the actual source before using it in tests.

### Bug discovery
The bugs (note required + zero/negative amounts accepted) were found by **reading the source code directly** — specifically `TransactionCreateStepTwo.tsx` lines 35-37 and 63. AI helped me locate the file quickly, but the root cause analysis was done by tracing the Yup validation schema and NumberFormat props.

### Written deliverables
AI helped with formatting and structuring the story feedback, manual test script, and technical criteria documents. The substance — which risks matter most, what questions to ask Product, which ACs are untestable — reflects my own QA judgment about what's important in a payments domain.

### Automated tests
AI generated the initial Playwright scaffolding and config. Significant debugging was needed to make tests work against the actual app:
- MUI wraps inputs in `<div>` elements — required targeting `[data-test="..."] input` instead of the wrapper
- The sidenav signout button is rendered but hidden until the drawer opens — needed `scrollIntoViewIfNeeded()` + `force: true`
- React Router client-side navigation doesn't trigger `waitForURL` — had to wait for specific elements instead
- Notifications show display names ("Ted Parisian") not usernames ("Heath93")

### What I would NOT use AI for
- Deciding test priority and risk levels — that requires domain understanding
- Judging whether a story is ready for development — that's a QA call
- Determining if a test failure is a real bug vs. a test issue — needs manual reproduction

