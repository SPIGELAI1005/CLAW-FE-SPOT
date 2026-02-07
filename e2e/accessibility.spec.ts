import { test, expect } from "@playwright/test";

test.describe("Accessibility Basics", () => {
  test("landing page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();
  });

  test("login page has accessible form labels", async ({ page }) => {
    await page.goto("/login");
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    // Check the input has an associated label or aria-label
    const ariaLabel = await emailInput.getAttribute("aria-label");
    const id = await emailInput.getAttribute("id");
    if (!ariaLabel) {
      // Should have a <label> pointing to it
      expect(id).toBeTruthy();
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toBeVisible();
    }
  });

  test("landing page has skip-link or navigation landmark", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav, [role="navigation"]');
    const count = await nav.count();
    expect(count).toBeGreaterThan(0);
  });
});
