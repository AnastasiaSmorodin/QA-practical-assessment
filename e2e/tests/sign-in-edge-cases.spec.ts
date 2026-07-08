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

test.describe("Sign-in Edge Cases & Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-test="signin-username"]');
  });

  test("TC-118-01: Invalid credentials show error message", async ({
    page,
  }) => {
    await page.fill('[data-test="signin-username"] input', "Heath93");
    await page.fill('[data-test="signin-password"] input', "wrongpassword");
    await page.click('[data-test="signin-submit"]');

    // Should remain on sign-in page with error
    await page.waitForSelector('[data-test="signin-error"]');
    await page.screenshot({
      path: `${screenshotDir}/edge-invalid-credentials-error.png`,
    });

    const errorText = await page.textContent('[data-test="signin-error"]');
    expect(errorText).toContain("Username or password is invalid");
  });

  test("TC-118-02: Empty username shows validation error", async ({
    page,
  }) => {
    // Focus and blur username to trigger validation
    await page.click('[data-test="signin-username"] input');
    await page.click('[data-test="signin-password"] input');

    await page.screenshot({
      path: `${screenshotDir}/edge-empty-username-validation.png`,
    });

    // Check submit button is disabled
    const submitButton = page.locator('[data-test="signin-submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("TC-118-03: Password shorter than 4 characters shows validation error", async ({
    page,
  }) => {
    await page.fill('[data-test="signin-username"] input', "Heath93");
    await page.fill('[data-test="signin-password"] input', "abc");
    // Trigger blur
    await page.click('[data-test="signin-username"] input');

    await page.screenshot({
      path: `${screenshotDir}/edge-short-password-validation.png`,
    });

    // Submit button should be disabled with short password
    const submitButton = page.locator('[data-test="signin-submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test("TC-118-04: Navigate to Sign Up page", async ({ page }) => {
    // Use direct navigation to verify the signup page exists and is accessible
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `${screenshotDir}/edge-signup-page-navigation.png`,
    });

    expect(page.url()).toContain("/signup");
    // Verify signup form elements are present
    const firstNameField = page.locator('[data-test="signup-first-name"]');
    await expect(firstNameField).toBeVisible();
  });
});
