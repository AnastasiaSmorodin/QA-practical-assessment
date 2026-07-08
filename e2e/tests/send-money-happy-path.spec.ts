import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const screenshotDir = path.join(__dirname, "..", "screenshots");

// Reset database before all tests in this file
test.beforeAll(async () => {
  execSync("cp data/database-seed.json data/database.json", {
    cwd: path.join(__dirname, "..", ".."),
  });
});

test.describe("TC-142-01: Happy Path — Login to Send Money", () => {
  test("Full journey: sign in → new transaction → select contact → enter amount/note → pay → verify", async ({
    page,
  }) => {
    // Step 1: Navigate to app
    await page.goto("/");
    await page.waitForSelector('[data-test="signin-username"]');
    await page.screenshot({
      path: `${screenshotDir}/01-sign-in-page.png`,
    });

    // Step 2: Sign in as Heath93
    await page.fill('[data-test="signin-username"] input', "Heath93");
    await page.fill('[data-test="signin-password"] input', "s3cret");
    await page.screenshot({
      path: `${screenshotDir}/02-credentials-entered.png`,
    });

    await page.click('[data-test="signin-submit"]');

    // Wait for redirect to home screen
    await page.waitForSelector('[data-test="nav-top-new-transaction"]', {
      timeout: 15000,
    });
    await page.screenshot({
      path: `${screenshotDir}/03-home-screen-after-login.png`,
    });

    // Step 3: Click "New" transaction button
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');
    await page.screenshot({
      path: `${screenshotDir}/04-new-transaction-contact-search.png`,
    });

    // Step 4: Search for contact
    await page.fill('[data-test="user-list-search-input"]', "Arvilla");

    // Wait for search results to appear
    await page.waitForSelector('[data-test*="user-list-item-"]');
    await page.screenshot({
      path: `${screenshotDir}/05-contact-search-results.png`,
    });

    // Step 5: Select the contact
    const userItem = page.locator('[data-test*="user-list-item-"]').first();
    await userItem.click();

    // Wait for amount form to appear
    await page.waitForSelector('[data-test="transaction-create-amount-input"]');
    await page.screenshot({
      path: `${screenshotDir}/06-amount-form-displayed.png`,
    });

    // Step 6: Enter amount
    await page.fill('[data-test="transaction-create-amount-input"] input', "25");
    await page.screenshot({
      path: `${screenshotDir}/07-amount-entered.png`,
    });

    // Step 7: Enter note
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      "Lunch yesterday"
    );
    await page.screenshot({
      path: `${screenshotDir}/08-note-entered.png`,
    });

    // Step 8: Click Pay
    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeEnabled();
    await payButton.click();

    // Step 9: Verify confirmation screen
    await page.waitForSelector(
      '[data-test="new-transaction-return-to-transactions"]',
      { timeout: 10000 }
    );
    await page.screenshot({
      path: `${screenshotDir}/09-payment-confirmation.png`,
    });

    // Verify confirmation content contains payment-related text
    const confirmationContent = await page.textContent("main") || await page.textContent("body");
    expect(confirmationContent).toContain("Paid");

    // Step 10: Return to transactions
    await page.click(
      '[data-test="new-transaction-return-to-transactions"]'
    );

    // Step 11: Navigate to Mine tab and verify transaction appears
    await page.click('[data-test="nav-personal-tab"]');
    await page.waitForSelector('[data-test*="transaction-item-"]', {
      timeout: 10000,
    });
    await page.screenshot({
      path: `${screenshotDir}/10-mine-feed-with-transaction.png`,
    });

    // Verify the transaction is in the feed with correct details
    const pageContent = await page.content();
    expect(pageContent).toContain("Lunch yesterday");
  });
});
