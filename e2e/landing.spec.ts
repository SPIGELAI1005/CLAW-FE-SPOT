import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders the landing page with hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CLAW/i);
    // The landing page should have a hero heading
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("has a login CTA button", async ({ page }) => {
    await page.goto("/");
    const loginButton = page.locator('a[href="/login"], button:has-text("Sign In"), a:has-text("Get Started")').first();
    await expect(loginButton).toBeVisible();
  });

  test("navigates to login page", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe("Login Page", () => {
  test("renders the login page with email input", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test("shows error on empty form submission", async ({ page }) => {
    await page.goto("/login");
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage,
      );
      expect(validationMessage.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Navigation", () => {
  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login or show login page
    await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
  });

  test("redirects unauthenticated users from spots to login", async ({ page }) => {
    await page.goto("/spots");
    await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
  });
});
