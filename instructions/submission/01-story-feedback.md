# Story Feedback — Shift-Left Review

**Story reviewed:** RWA-142 · Send money to a contact  
**Reviewer:** Anastasia Smorodin  
**Date:** 2026-07-07  
**Status:** ⚠️ Not ready — see recommendation below

---

## Ambiguities & Gaps

1. **Amount limits not defined** — What is the minimum and maximum amount a user can send? Is there a daily/weekly transfer limit? What happens when a user tries to exceed it?

2. **Insufficient balance behavior** — The story does not specify what happens if the sender's linked bank account has insufficient funds. Is there a balance check? Is there an error state?

3. **Currency/rounding rules** — The story uses "$25.00" but doesn't define:
   - What currency is supported (USD only?)
   - How many decimal places are allowed (e.g., $25.999?)
   - How rounding is handled for amounts like $0.001

4. **Concurrent transactions** — What happens if two payments are submitted simultaneously by the same user? Is there a race condition on balance?

5. **Note character limit** — AC5 says note is optional, but there's no mention of maximum length. Can a user submit a 10,000 character note?

6. **Self-payment** — Can a user send money to themselves? The story doesn't explicitly exclude this.

7. **"Linked bank account" requirement enforcement** — What exactly happens when a user with no bank account tries to send money? What error/redirection is shown?

8. **Transaction status/confirmation** — AC1 says "confirmation screen" but doesn't define what information is shown (transaction ID? timestamp? new balance?).

9. **Privacy rules undefined** — AC6 references "privacy rules" for the public feed but doesn't specify them. What exactly is hidden? Amount only, or also the note?

10. **Contact search behavior** — How does search work? Full name match? Partial? Case-sensitive? What if there are hundreds of results?

---

## Untestable or Weak Acceptance Criteria

### AC1 — "confirmation screen for the completed payment"
**Problem:** "Confirmation screen" is vague — no specific elements to verify.  
**Rewrite:**
```gherkin
Then I see a confirmation message containing "Paid" or "Transaction Submitted"
And the transaction details show the recipient name, amount "$25.00", and note "Lunch yesterday"
And a "Return to Transactions" button is visible
```

### AC2 — "amount is shown as a credit (incoming) for the receiver"
**Problem:** "Credit (incoming)" doesn't define a visual indicator to test.  
**Rewrite:**
```gherkin
And the transaction amount displays with a "+" prefix (e.g. "+$25.00") indicating received funds
```

### AC3 — "the Pay button is disabled"
**Problem:** Doesn't specify when validation fires (on blur, on keypress, on submit attempt). Doesn't mention the "Request" button — should it also be disabled?  
**Rewrite:**
```gherkin
Given I am on the payment amount step
When I enter "0", a negative value, or leave the amount empty
Then both the "Pay" and "Request" buttons remain disabled
And a validation message indicates a valid positive amount is required
And validation is applied in real-time as the user types
```

### AC6 — "without the exact amount exposed per privacy rules"
**Problem:** "Privacy rules" are not defined anywhere in the story. Untestable without a spec.  
**Rewrite:** Define the rule explicitly, e.g.:
```gherkin
Then they see the transaction with sender/receiver names and note
But the exact dollar amount is not displayed (shows "paid" without "$25.00")
```

---

## Missing Scenarios

| # | Scenario | Risk |
|---|----------|------|
| 1 | Sender has no linked bank account — blocked with clear message | High |
| 2 | Insufficient funds / balance below payment amount | High |
| 3 | Amount with excessive decimal places (e.g., $25.999) | Medium |
| 4 | Amount of exactly $0.01 (minimum boundary) | Medium |
| 5 | Very large amount (e.g., $999,999.99) | Medium |
| 6 | Negative amount entered in the input field | High |
| 7 | Special characters or XSS in the note field | Medium |
| 8 | Network failure mid-transaction | High |
| 9 | Double-click / double-submit on Pay button | High |
| 10 | Sending to a deactivated/deleted user | Medium |
| 11 | Session expiry during transaction flow | Medium |
| 12 | Accessibility — screen reader announces confirmation | Low |

---

## Questions for Product/Design/Eng

1. **For Product:** What are the min/max transaction amounts? Is there a daily limit?
2. **For Product:** What privacy rules apply to the public feed? Is the amount always hidden, or only for non-friends?
3. **For Product:** Is the note field truly optional? (Current implementation requires it — see bug report.)
4. **For Design:** What does the "no bank account" error state look like? Is the user redirected to add one?
5. **For Design:** What does the confirmation screen contain? Transaction ID? Updated balance?
6. **For Engineering:** Is there a debounce/lock on the Pay button to prevent double-submission?
7. **For Engineering:** Does the amount input allow negative values? (Current implementation allows it — see bug report.)
8. **For Engineering:** What happens at the API level if the description is empty? Is it validated server-side?
9. **For Product:** Can a user send money to themselves? Should this be blocked?
10. **For Engineering:** Is the transaction creation atomic? What about concurrent requests?

---

## Recommendation

**❌ This story is NOT ready to be worked on.**

**Blockers that must be resolved first:**

1. **Define amount boundaries** — min, max, decimal precision, and daily limits must be specified before development and QA can agree on "done."
2. **Clarify the note field requirement** — AC5 says optional, but if the implementation enforces it (which it currently does), the story and code disagree. Product must decide.
3. **Define privacy rules** — AC6 is untestable without a clear spec on what is/isn't visible in public feeds.
4. **Specify the "no bank account" error state** — The precondition says bank account is required, but there's no AC for what happens when it's missing.
5. **Negative amount handling** — AC3 mentions it but the technical implementation currently allows negatives through the input mask.

**Once these are addressed**, the story is well-structured and actionable. The Gherkin ACs are a strong starting point — they just need tightening on the validation and error-state edges.
