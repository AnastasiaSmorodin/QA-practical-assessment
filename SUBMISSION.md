# QA Practical Assessment — Submission

**Candidate:** Anastasia Smorodin  
**Date:** 2026-07-07  
**Story focus:** RWA-142 · Send money to a contact (primary) + RWA-118 · Sign in (covered in automation)  
**Time spent:** ~3.5 hours

---

## Summary

I approached this assessment story-first: reviewing the acceptance criteria, identifying gaps, and documenting what would need to change before this story is truly "done." The automated tests followed naturally from that analysis — and exposed two real bugs that the ACs predicted but the implementation missed.

## What's here

| Deliverable | Path | Notes |
|---|---|---|
| Story feedback | `instructions/submission/01-story-feedback.md` | Shift-left review — verdict: **not ready** |
| QA annotations | `instructions/jira-ticket.md` (bottom) | Risk, test type, data deps per AC |
| Manual test script | `instructions/submission/02-manual-test-script.md` | 10 test cases with steps |
| Technical criteria | `instructions/submission/03-technical-criteria.md` | Selectors, API contracts, data strategy |
| Automated tests | `e2e/tests/` | 4 spec files, 16 tests, Playwright |
| Screenshots | `e2e/screenshots/` | 34 step-by-step captures |
| Bug reports | `instructions/submission/bug-report.md` | 2 bugs: note required + amount validation |
| CI workflow | `.github/workflows/e2e.yml` | GitHub Actions — runs on PR |
| AI usage | `AI-USAGE.md` | Transparent about what AI did/didn't do |

## Test results

```
13 passed
 3 failed (intentional — documenting real bugs)
```

The 3 failing tests assert what the acceptance criteria **say should happen** vs. what the app **actually does**:
- AC3: Zero amount → Pay should be disabled (it's enabled)
- AC3: Negative amount → Pay should be disabled (it's enabled)
- AC5: Empty note → Pay should be enabled (it's disabled)

These are kept as failing tests by design — a failing test that catches a real defect is more valuable than a green suite that lies.

## Key observations

1. The validation schema in `TransactionCreateStepTwo.tsx` uses `number().required()` without `.positive()` — so zero and negatives pass
2. The same schema marks `description` as `.required()` despite the story saying notes are optional
3. The `NumberFormat` component has `allowNegative={true}` which contradicts AC3

## What I'd do with more time

- API-layer contract tests (`POST /transactions` response schema validation)
- Visual regression testing on the confirmation screen
- Accessibility audit (keyboard nav, ARIA labels, screen reader testing)
- Performance: measure time-to-interactive after payment submission
- Cross-browser: Firefox and WebKit coverage
