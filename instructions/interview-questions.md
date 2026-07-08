# Senior Quality Engineer — Interview Questions (live discussion)

These questions complement the practical assessment. They're for the live/panel conversation and probe the strategic, upstream, and AI-related parts of the role that a take-home can't fully show. Each question lists what a **strong answer** demonstrates and common **red flags**, mapped to the role.

---

### 1. Building / maturing a practice

> Tell me about a QA or test automation practice you helped build or significantly mature. What was the state before, what did you change, and how did you measure improvement?

**Strong answer shows:** ownership of a practice (not just operating inside someone else's), a clear before/after, concrete changes (standards, tooling, coverage strategy, CI gating), and **metrics** — escaped defects, lead time, flake rate, coverage of critical flows, release confidence. Ties changes to outcomes.

**Red flags:** only ran existing tests; no baseline or measurement; "we added a lot of tests" with no notion of value or maintenance cost.

---

### 2. Choosing the right layer of coverage

> How do you decide what should be covered by automated UI tests, API tests, smoke tests, regression tests, and manual validation?

**Strong answer shows:** a risk- and cost-based model (test pyramid / trophy), pushing logic down to API/contract where possible, reserving UI E2E for critical user journeys, smoke for fast release gating, manual/exploratory for nuance and new features. Talks about maintenance cost and signal-to-noise.

**Red flags:** "automate everything through the UI"; no sense of trade-offs; can't say what they'd *not* automate.

---

### 3. Getting involved before development starts

> Describe how you would get involved before development starts to make Jira stories, acceptance criteria, and designs more testable.

**Strong answer shows:** joins refinement/three-amigos, rewrites vague ACs into objective/verifiable ones, surfaces edge cases and missing states early, agrees on "done" up front, asks for testability hooks (stable `data-test` IDs, seed/test data, feature flags). Treats quality as a team responsibility.

**Red flags:** sees QA as a final gate; waits for a "ready to test" hand-off; no influence on requirements or design.

---

### 4. AI-assisted QA — a specific example

> How have you used AI-assisted QA tools to improve test creation, coverage analysis, defect detection, or test maintenance? Give a specific example.

**Strong answer shows:** a concrete, real example (test generation, coverage gap analysis, flaky-test triage, self-healing locators, exploratory assistance) with the tool named, what it produced, and **how they verified/edited the output**. Net effect on speed or coverage without a maintenance mess.

**Red flags:** hand-wavy "we use AI"; pasted output without review; can't describe a real workflow.

---

### 5. Trust in AI-generated / self-healing automation

> What risks do you see with AI-generated tests or self-healing automation, and how would you keep the test suite trustworthy? We want to build confidence around quality.

**Strong answer shows:** awareness that AI can produce tests that pass without truly asserting behavior, self-healing can mask real regressions, and generated tests can be brittle or redundant. Keeps trust via human review, meaningful assertions, mutation/coverage checks, flake budgets, treating tests as first-class code, and never letting a tool silently "fix" a failing test. Connects to "a green build means we're good to go."

**Red flags:** full trust in generated/self-healing tests; equates passing with correct; no plan to validate that tests actually catch regressions.

---

_Use these to go deeper on the take-home: e.g. ask the candidate to walk through their story feedback (Q3), their tooling/layer choices (Q2), and how they used (or chose not to use) AI on the exercise (Q4–Q5)._
