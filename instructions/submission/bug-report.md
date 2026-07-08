# BUG: Note field is required despite AC5 stating it should be optional

**Severity:** High  
**Priority:** P1  
**Affected story / AC:** RWA-142 · AC5 (Note is optional)  
**Environment:** local — commit from main branch, Chromium (latest), Node 22.20.0

## Steps to reproduce

1. Start the app with `yarn dev`
2. Log in as `Heath93` with password `s3cret`
3. Click the "New" button (dollar sign icon in top nav)
4. Search for and select contact `Arvilla_Hegmann`
5. Enter a valid amount of "$25" in the amount field
6. Leave the note field completely empty
7. Observe the "Pay" button state

## Expected result

Per AC5: "When I leave the note field empty And I click 'Pay' Then the payment completes successfully with no note."

The Pay button should be **enabled** when a valid amount is entered but no note is provided. Clicking Pay should submit the transaction successfully.

## Actual result

The "Pay" button remains **disabled** when the note field is empty. The form displays a validation error "Please enter a note" when the user interacts with the note field and leaves it empty. The transaction **cannot** be submitted without a note.

## Root cause

In `src/components/TransactionCreateStepTwo.tsx`, the Yup validation schema on line 34-38 defines:

```javascript
const validationSchema = object({
  amount: number().required("Please enter a valid amount"),
  description: string().required("Please enter a note"),  // ← BUG: should NOT be required
  senderId: string(),
  receiverId: string(),
});
```

The `description` field uses `.required("Please enter a note")` which forces validation to fail when the field is empty. Additionally, the TextField component on line 160 has the HTML `required` attribute set.

**Fix:** Change `description: string().required("Please enter a note")` to `description: string()` and remove the `required` prop from the TextField.

## Evidence

- Failing automated test: `e2e/tests/send-money-edge-cases.spec.ts` — "TC-142-07: Note field is optional (BUG — expects fail per AC5)"
- Screenshot: `e2e/screenshots/bug-note-required-error.png` (captured during test run)
- Source code: `src/components/TransactionCreateStepTwo.tsx:37`

## Impact / notes

**High impact for UX and spec compliance.** The story description explicitly states "an optional note" and AC5 defines the scenario. Users are currently forced to write a note for every payment, which:
- Violates the accepted product specification
- Adds unnecessary friction to the payment flow
- May confuse users who don't have a reason to add a note

This is a clear case where the implementation does not match the acceptance criteria agreed upon in the story. The defect is in the frontend validation schema — the backend API may or may not independently validate this field (should be verified).

---

# BUG: Zero and negative amounts are accepted — AC3 amount validation not enforced

**Severity:** Critical  
**Priority:** P1  
**Affected story / AC:** RWA-142 · AC3 (Amount validation)  
**Environment:** local — commit from main branch, Chromium (latest), Node 22.20.0

## Steps to reproduce

### Scenario A — Negative amount:
1. Start the app with `yarn dev`
2. Log in as `Heath93` with password `s3cret`
3. Click the "New" button (dollar sign icon in top nav)
4. Search for and select contact `Arvilla_Hegmann`
5. In the amount field, type `-50`
6. Enter any note (e.g., "Test")
7. Observe the "Pay" button state — it is **enabled** (should be disabled)

### Scenario B — Zero amount:
1. Follow steps 1-4 above
5. In the amount field, type `0`
6. Enter any note (e.g., "Test zero")
7. Observe the "Pay" button state — it is **enabled** (should be disabled)

## Expected result

Per AC3: "When I enter '0', a negative value, or leave the amount empty Then the 'Pay' button is disabled And I cannot proceed until a valid positive amount is entered."

The Pay button should be **disabled** when zero or a negative amount is entered.

## Actual result

The Pay button is **enabled** when zero or negative amounts are entered. The form can be submitted with these invalid values. Only an empty/blank amount correctly disables the button.

## Root cause

Two issues in `src/components/TransactionCreateStepTwo.tsx`:

1. **Line 63:** `allowNegative={true}` — the NumberFormat input component explicitly allows negative numbers to be typed.
2. **Line 35:** `amount: number().required("Please enter a valid amount")` — the Yup schema validates only that amount is a number and present, but does NOT enforce `.positive()` or `.min(0.01)`.

The `required()` validator only checks for presence (not empty/null/undefined). A value of `0` passes `required()` because it's a valid number. Negative values also pass because there's no `.positive()` or `.min()` constraint.

**Fix:**
- Change `allowNegative={true}` to `allowNegative={false}`
- Change `amount: number().required(...)` to `amount: number().positive("Please enter a valid amount").required("Please enter a valid amount")`

## Evidence

- Failing automated test: `e2e/tests/send-money-edge-cases.spec.ts` — "TC-142-05: Negative amount should disable Pay button (BUG — expects fail)"
- Failing automated test: `e2e/tests/send-money-edge-cases.spec.ts` — "TC-142-04: Zero amount keeps Pay button disabled (BUG — expects fail per AC3)"
- Screenshot: `e2e/screenshots/bug-negative-amount-accepted.png`
- Screenshot: `e2e/screenshots/bug-zero-amount-pay-enabled.png`
- Source code: `src/components/TransactionCreateStepTwo.tsx:35,63`

## Impact / notes

**Critical impact for a payments application.** Allowing zero or negative amounts in a payment:
- **Zero amount:** Creates meaningless transactions that pollute feeds and trigger false notifications
- **Negative amount:** Could potentially enable theft (sending "-$50" might credit the sender and debit the receiver, depending on backend handling)
- Creates data integrity issues in transaction history and balance calculations
- Violates the explicit acceptance criteria defined in AC3

Even if the backend independently rejects these values, the frontend must enforce validation to:
1. Prevent user confusion
2. Avoid unnecessary API calls
3. Maintain defense-in-depth against money-movement errors

The combination of `allowNegative={true}` (input mask) and missing `.positive()` (validation schema) means there are **zero client-side guards** against invalid amounts — only the `required()` check prevents empty submissions.
