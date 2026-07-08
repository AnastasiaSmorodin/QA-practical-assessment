# Manual Test Script — RWA-142 · Send Money to a Contact

**Story:** RWA-142  
**Author:** Anastasia Smorodin  
**Date:** 2026-07-07  
**App version:** local dev (commit from main branch)  
**Password for all seeded users:** `s3cret`

---

## TC-142-01 · Send a valid payment (Happy Path)

**Priority:** P1 — Critical  
**Automation candidate:** Yes  

### Preconditions
- User `Heath93` is logged in
- User has at least one linked bank account
- User `Arvilla_Hegmann` exists as a potential recipient
- Database freshly seeded (`yarn db:seed:dev`)

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Navigate to http://localhost:3000 | Sign In page loads |
| 2 | Enter username `Heath93` and password `s3cret`, click Sign In | Redirected to home screen with transaction feed |
| 3 | Click the "New" button (top nav, dollar sign icon) | New Transaction page opens with user search |
| 4 | Type `Arvilla` in the search field | User `Arvilla_Hegmann` appears in results |
| 5 | Click on `Arvilla_Hegmann` | Amount/note form appears with Arvilla's name and avatar |
| 6 | Enter amount `$25` | Amount field shows "$25" |
| 7 | Enter note "Lunch yesterday" | Note field populated |
| 8 | Click "Pay" button | Transaction submitted; confirmation screen shown |
| 9 | Verify confirmation screen | Shows "Paid" message with amount and recipient info |
| 10 | Click "Return To Transactions" | Returns to home feed |
| 11 | Navigate to "Mine" tab | Transaction "Lunch yesterday" / "$25.00" visible at top |

---

## TC-142-02 · Receiver notification and transaction visibility

**Priority:** P1 — High  
**Automation candidate:** Yes  

### Preconditions
- TC-142-01 has been executed (payment from Heath93 to Arvilla_Hegmann)
- Database state reflects the completed transaction

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log out as Heath93 | Returns to Sign In screen |
| 2 | Log in as `Arvilla_Hegmann` / `s3cret` | Home screen loads |
| 3 | Check notification bell icon | Notification count badge shows at least 1 |
| 4 | Click notifications | Notification list shows payment received from Heath93 |
| 5 | Navigate to "Mine" tab | Transaction from Heath93 for $25.00 is visible |
| 6 | Verify amount display | Amount shows as positive/credit (received) |

---

## TC-142-03 · Amount validation — empty amount

**Priority:** P1 — High  
**Automation candidate:** Yes  

### Preconditions
- User is logged in and has navigated to amount/note step with a contact selected

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Leave amount field empty | Pay button remains disabled |
| 2 | Attempt to click "Pay" | Nothing happens; button is not clickable |

---

## TC-142-04 · Amount validation — zero amount

**Priority:** P1 — High  
**Automation candidate:** Yes  

### Preconditions
- Same as TC-142-03

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Enter "0" in the amount field | Validation error appears |
| 2 | Verify "Pay" button state | Pay button remains disabled |

---

## TC-142-05 · Amount validation — negative amount

**Priority:** P1 — High  
**Automation candidate:** Yes  

### Preconditions
- Same as TC-142-03

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Enter "-50" in the amount field | Input should reject negative OR validation error appears |
| 2 | Verify "Pay" button state | Pay button should be disabled |

**NOTE:** This test is expected to FAIL — the current implementation has `allowNegative={true}` and no min-value validation in the schema. See bug report.

---

## TC-142-06 · Contact is required before proceeding

**Priority:** P2 — Medium  
**Automation candidate:** Yes  

### Preconditions
- User is logged in and clicks "New" transaction

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | On the user search page, do NOT select any contact | Amount/note form is not shown |
| 2 | Verify there is no way to reach the amount step | Only the contact search step is available |

---

## TC-142-07 · Note is optional (AC5)

**Priority:** P1 — High  
**Automation candidate:** Yes  

### Preconditions
- User is logged in with a linked bank account
- Contact has been selected

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Enter a valid amount "$10" | Amount field populated |
| 2 | Leave the note field completely empty | No text in note field |
| 3 | Click "Pay" | Payment should complete successfully |

**NOTE:** This test is expected to FAIL — the current implementation requires the note field (`description: string().required()`). This contradicts AC5. See bug report.

---

## TC-142-08 · Feed privacy — third-party user view

**Priority:** P2 — Medium  
**Automation candidate:** Yes  

### Preconditions
- A payment has been completed between Heath93 and Arvilla_Hegmann
- A third user (`Dina20`) is not connected to either

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as `Dina20` / `s3cret` | Home screen loads |
| 2 | Navigate to "Everyone" (public) tab | Public transactions feed shown |
| 3 | Find the Heath93→Arvilla_Hegmann transaction | Transaction is visible (if public) |
| 4 | Verify amount visibility | Exact amount should NOT be shown per privacy rules |
| 5 | Navigate to "Mine" tab | This transaction should NOT appear |
| 6 | Navigate to "Friends" tab | This transaction should NOT appear |

---

## TC-142-09 · No linked bank account — blocked state

**Priority:** P1 — High  
**Automation candidate:** Yes (edge case)  

### Preconditions
- A user exists with NO linked bank account (or bank accounts are deleted)

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Log in as user with no bank account | Home screen loads |
| 2 | Click "New" transaction | User is shown a message/modal indicating a bank account must be linked first, OR is redirected to add a bank account |

---

## TC-142-10 · Large amount boundary test

**Priority:** P3 — Low  
**Automation candidate:** Yes  

### Preconditions
- User is logged in, contact selected, on amount step

### Steps

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Enter amount "$999,999" | Field accepts or rejects based on system limits |
| 2 | Verify "Pay" button state | If accepted, Pay is enabled; otherwise disabled with message |

---

## Summary

| Test ID | Title | Priority | Automation |
|---------|-------|----------|------------|
| TC-142-01 | Send a valid payment (Happy Path) | P1 | ✅ |
| TC-142-02 | Receiver notification and visibility | P1 | ✅ |
| TC-142-03 | Amount validation — empty | P1 | ✅ |
| TC-142-04 | Amount validation — zero | P1 | ✅ |
| TC-142-05 | Amount validation — negative | P1 | ✅ (expects FAIL) |
| TC-142-06 | Contact required | P2 | ✅ |
| TC-142-07 | Note is optional | P1 | ✅ (expects FAIL) |
| TC-142-08 | Feed privacy | P2 | ✅ |
| TC-142-09 | No bank account | P1 | ✅ |
| TC-142-10 | Large amount boundary | P3 | ✅ |
