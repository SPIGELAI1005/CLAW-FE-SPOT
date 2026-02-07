import { test, expect } from "@playwright/test";

test.describe("Roles Page (unauthenticated)", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/roles");
    await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
  });
});

test.describe("Agent Creation Page (unauthenticated)", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/roles/agent/new");
    await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
  });
});
