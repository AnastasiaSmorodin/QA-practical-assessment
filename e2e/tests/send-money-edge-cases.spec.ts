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
 * Helper: Log in and navigate to the amount/note step with a contact selected
 */
async function navigateToAmountStep(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForSelector('[data-test="signin-username"]');
  await page.fill('[data-test="signin-username"] input', "Heath93");
  await page.fill('[data-test="signin-password"] input', "s3cret");
  await page.click('[data-test="signin-submit"]');
  await page.waitForSelector('[data-test="nav-top-new-transaction"]', {
    timeout: 15000,
  });
  await page.click('[data-test="nav-top-new-transaction"]');
  await page.waitForSelector('[data-test="user-list-search-input"]');
  await page.fill('[data-test="user-list-search-input"]', "Arvilla");
  await page.waitForSelector('[data-test*="user-list-item-"]');
  await page.locator('[data-test*="user-list-item-"]').first().click();
  await page.waitForSelector('[data-test="transaction-create-amount-input"]');
}

test.describe("Send Money — Edge Cases & Validation", () => {
  test("TC-142-03: Empty amount keeps Pay button disabled", async ({
    page,
  }) => {
    await navigateToAmountStep(page);

    // Don't enter any amount — just interact with the field and leave it
    await page.click('[data-test="transaction-create-amount-input"] input');
    await page.click(
      '[data-test="transaction-create-description-input"] input'
    );

    await page.screenshot({
      path: `${screenshotDir}/edge-empty-amount-pay-disabled.png`,
    });

    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeDisabled();
  });

  test("TC-142-04: Zero amount keeps Pay button disabled (BUG — expects fail per AC3)", async ({
    page,
  }) => {
    await navigateToAmountStep(page);

    await page.fill(
      '[data-test="transaction-create-amount-input"] input',
      "0"
    );
    // Add a note so only amount validation is tested
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      "Test zero"
    );

    await page.screenshot({
      path: `${screenshotDir}/bug-zero-amount-pay-enabled.png`,
    });

    // Per AC3: "0" should disable Pay button — but the implementation allows it
    // This documents a real bug: validation schema only has number().required()
    // and does not enforce .positive() or .min(0.01)
    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeDisabled();
  });

  test("TC-142-05: Negative amount should disable Pay button (BUG — expects fail)", async ({
    page,
  }) => {
    await navigateToAmountStep(page);

    await page.fill(
      '[data-test="transaction-create-amount-input"] input',
      "-50"
    );
    await page.fill(
      '[data-test="transaction-create-description-input"] input',
      "Negative test"
    );

    await page.screenshot({
      path: `${screenshotDir}/bug-negative-amount-accepted.png`,
    });

    // Per AC3: negative values should disable Pay button
    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeDisabled();
  });

  test("TC-142-06: Contact is required — cannot reach amount step without selecting", async ({
    page,
  }) => {
    await page.goto("/");
    await page.fill('[data-test="signin-username"] input', "Heath93");
    await page.fill('[data-test="signin-password"] input', "s3cret");
    await page.click('[data-test="signin-submit"]');
    await page.waitForSelector('[data-test="nav-top-new-transaction"]', {
      timeout: 15000,
    });
    await page.click('[data-test="nav-top-new-transaction"]');
    await page.waitForSelector('[data-test="user-list-search-input"]');

    await page.screenshot({
      path: `${screenshotDir}/edge-no-contact-selected.png`,
    });

    // Without selecting a contact, the amount form should NOT be visible
    const amountInput = page.locator(
      '[data-test="transaction-create-amount-input"]'
    );
    await expect(amountInput).not.toBeVisible();
  });

  test("TC-142-07: Note field is optional (BUG — expects fail per AC5)", async ({
    page,
  }) => {
    await navigateToAmountStep(page);

    // Enter a valid amount
    await page.fill(
      '[data-test="transaction-create-amount-input"] input',
      "10"
    );

    // Leave note field empty — do NOT type anything in it
    // Just verify we can submit without a note

    await page.screenshot({
      path: `${screenshotDir}/bug-note-required-error.png`,
    });

    // Per AC5: Pay button should be enabled with valid amount and empty note
    const payButton = page.locator(
      '[data-test="transaction-create-submit-payment"]'
    );
    await expect(payButton).toBeEnabled();
  });
});
