import { test, expect } from "@playwright/test";

test("dashboard loads KPIs and ask panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Nimbus Commerce Analytics/i })).toBeVisible();
  await expect(page.getByText("Total revenue")).toBeVisible();

  await page.getByTestId("ask-input").fill("Show revenue by region");
  await page.getByTestId("ask-submit").click();
  const result = page.getByTestId("ask-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  await expect(result).toContainText(/Source: keyword · revenue by region/i);
});
