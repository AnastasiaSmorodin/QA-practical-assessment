import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const screenshotDir = path.join(__dirname, "..", "screenshots");

// Reset database before all tests
test.beforeAll(async () => {
  execSync("cp data/database-seed.json data/database.json", {
    cwd: path.join(__dirname, "..", ".."),
  });
});

/**
 * Helper: Sign in as a given user
 */
async function signIn(page: import("@playwright/test").Page, username: string) {
  await page.goto("/");
  await page.waitForSelector('[data-test="signin-username"]');
  await page.fill('[data-test="signin-username"] input', username);
  await page.fill('[data-test="signin-password"] input', "s3cret");
  await page.click('[data-test="signin-submit"]');
  await page.waitForSelector('[data-test="nav-top-new-transaction"]', {
    timeout: 15000,
  });
}

test.describe("Advanced Edge Cases — Differentiated Coverage", () => {
  test("TC-142-11: Receiver sees notification after payment (AC2 — multi-user)", async ({
    page,
  }) => {
    // Step 1: Send a payment as Heath93
    await signIn(page, "Heath93");
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');
    await page.fill('[data-test="user-list-search-input"]', "Arvilla");
    await page.waitForSelector('[data-test*="user-list-item-"]');
    await page.locator('[data-test*="user-list-item-"]').first().click();
    await page.waitForSelector('[data-test="transaction-create-amount-input"]');

    const uniqueNote = `Multi-user test ${Date.now()}`;
    await page.fill('[data-test="transaction-create-amount-input"] input', "15");
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      uniqueNote
    );
    await page.click('[data-test="transaction-create-submit-payment"]');
    await page.waitForSelector(
      '[data-test="new-transaction-return-to-transactions"]'
    );
    await page.screenshot({
      path: `${screenshotDir}/advanced-multiuser-payment-sent.png`,
    });

    // Step 2: Log out via sidenav
    // The signout button is in the drawer — force click as it may be below the fold
    const signoutBtn = page.locator('[data-test="sidenav-signout"]');
    await signoutBtn.scrollIntoViewIfNeeded();
    await signoutBtn.click({ force: true });

    // Wait for redirect to sign-in
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });

    // Step 3: Log in as receiver (Arvilla_Hegmann) and check notification
    await signIn(page, "Arvilla_Hegmann");

    // Check notification count badge exists
    const notificationCount = page.locator(
      '[data-test="nav-top-notifications-count"]'
    );
    await expect(notificationCount).toBeVisible({ timeout: 5000 });
    await page.screenshot({
      path: `${screenshotDir}/advanced-multiuser-receiver-notification-badge.png`,
    });

    // Click notifications and verify
    await page.click('[data-test="nav-top-notifications-link"]');
    await page.waitForSelector('[data-test="notifications-list"]');
    await page.screenshot({
      path: `${screenshotDir}/advanced-multiuser-receiver-notifications-list.png`,
    });

    // Verify the notification list contains reference to the sender
    const notificationsContent = await page.content();
    // Notifications show display names, not usernames
    expect(notificationsContent).toContain("Ted");
  });

  test("TC-118-05: Protected route redirects to sign-in when unauthenticated", async ({
    page,
  }) => {
    // Try to access protected routes directly without signing in
    await page.goto("/personal");
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });
    await page.screenshot({
      path: `${screenshotDir}/advanced-protected-route-personal-redirect.png`,
    });
    expect(page.url()).toContain("signin");

    // Try /bankaccounts
    await page.goto("/bankaccounts");
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });
    await page.screenshot({
      path: `${screenshotDir}/advanced-protected-route-bankaccounts-redirect.png`,
    });
    expect(page.url()).toContain("signin");

    // Try /transaction/new
    await page.goto("/transaction/new");
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });
    expect(page.url()).toContain("signin");
  });

  test("TC-142-12: Very large amount ($999,999) — boundary test", async ({
    page,
  }) => {
    await signIn(page, "Heath93");
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');
    await page.fill('[data-test="user-list-search-input"]', "Arvilla");
    await page.waitForSelector('[data-test*="user-list-item-"]');
    await page.locator('[data-test*="user-list-item-"]').first().click();
    await page.waitForSelector('[data-test="transaction-create-amount-input"]');

    await page.fill(
      '[data-test="transaction-create-amount-input"] input',
      "999999"
    );
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      "Large amount test"
    );

    await page.screenshot({
      path: `${screenshotDir}/advanced-large-amount-entered.png`,
    });

    // Verify the formatted display shows the number correctly
    const inputValue = await page
      .locator('[data-test="transaction-create-amount-input"] input')
      .inputValue();
    // NumberFormat should add thousand separators
    expect(inputValue).toContain("999");

    // Pay button should be enabled (no max limit enforced)
    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeEnabled();

    // Submit and verify it goes through (no server-side limit)
    await payButton.click();
    await page.waitForSelector(
      '[data-test="new-transaction-return-to-transactions"]',
      { timeout: 10000 }
    );
    await page.screenshot({
      path: `${screenshotDir}/advanced-large-amount-confirmation.png`,
    });
  });

  test("TC-142-13: Unicode and emoji in note field", async ({ page }) => {
    await signIn(page, "Heath93");
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');
    await page.fill('[data-test="user-list-search-input"]', "Arvilla");
    await page.waitForSelector('[data-test*="user-list-item-"]');
    await page.locator('[data-test*="user-list-item-"]').first().click();
    await page.waitForSelector('[data-test="transaction-create-amount-input"]');

    const unicodeNote = "Café payment 🍕🎉 — ñoño résumé";
    await page.fill('[data-test="transaction-create-amount-input"] input', "7");
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      unicodeNote
    );

    await page.screenshot({
      path: `${screenshotDir}/advanced-unicode-emoji-note.png`,
    });

    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeEnabled();
    await payButton.click();

    await page.waitForSelector(
      '[data-test="new-transaction-return-to-transactions"]',
      { timeout: 10000 }
    );
    await page.screenshot({
      path: `${screenshotDir}/advanced-unicode-emoji-confirmation.png`,
    });

    // Verify the unicode note is preserved on confirmation
    const bodyContent = await page.content();
    expect(bodyContent).toContain("Café");
    expect(bodyContent).toContain("🍕");
  });

  test("TC-118-06: Sign out clears session and blocks access", async ({
    page,
  }) => {
    // Sign in first
    await signIn(page, "Heath93");
    await page.screenshot({
      path: `${screenshotDir}/advanced-signout-before.png`,
    });

    // Open sidenav and click logout
    const logoutBtn = page.locator('[data-test="sidenav-signout"]');
    await logoutBtn.scrollIntoViewIfNeeded();
    await logoutBtn.click({ force: true });

    // Should be back on sign-in page
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });
    await page.screenshot({
      path: `${screenshotDir}/advanced-signout-redirected.png`,
    });
    expect(page.url()).toContain("signin");

    // Verify session is cleared — navigating to protected route should redirect
    await page.goto("/personal");
    await page.waitForSelector('[data-test="signin-username"]', {
      timeout: 10000,
    });
    expect(page.url()).toContain("signin");
    await page.screenshot({
      path: `${screenshotDir}/advanced-signout-session-cleared.png`,
    });
  });

  test("TC-142-14: Payment with minimum valid amount ($0.01)", async ({
    page,
  }) => {
    await signIn(page, "Heath93");
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');
    await page.fill('[data-test="user-list-search-input"]', "Arvilla");
    await page.waitForSelector('[data-test*="user-list-item-"]');
    await page.locator('[data-test*="user-list-item-"]').first().click();
    await page.waitForSelector('[data-test="transaction-create-amount-input"]');

    await page.fill(
      '[data-test="transaction-create-amount-input"] input',
      "0.01"
    );
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      "Penny test"
    );

    await page.screenshot({
      path: `${screenshotDir}/advanced-minimum-amount-entered.png`,
    });

    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeEnabled();
    await payButton.click();

    await page.waitForSelector(
      '[data-test="new-transaction-return-to-transactions"]',
      { timeout: 10000 }
    );
    await page.screenshot({
      path: `${screenshotDir}/advanced-minimum-amount-confirmation.png`,
    });

    // Verify the penny amount is shown
    const bodyContent = await page.content();
    expect(bodyContent).toContain("0.01");
  });
});
