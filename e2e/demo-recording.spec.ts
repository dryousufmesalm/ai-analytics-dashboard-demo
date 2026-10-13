import { test, expect } from "@playwright/test";

test("record main dashboard flow", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page.waitForTimeout(2000);

  await expect(page.getByRole("heading", { name: /Nimbus Commerce Analytics/i })).toBeVisible();
  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: "Europe" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "APAC" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Commerce" }).click();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "mobile" }).click();
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
  await page.waitForTimeout(2500);

  await page.getByTestId("ask-input").fill("Show revenue trend over time");
  await page.getByTestId("ask-submit").click();
  await expect(page.getByTestId("ask-result")).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(4000);

  await page.getByRole("button", { name: "Revenue by region" }).click();
  await expect(page.getByTestId("ask-result")).toBeVisible();
  await page.waitForTimeout(4000);

  await page.getByRole("button", { name: "Orders by channel" }).click();
  await expect(page.getByTestId("ask-result")).toBeVisible();
  await page.waitForTimeout(4000);

  await page.getByRole("button", { name: "enterprise" }).click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(3000);

  await page.getByTestId("ask-input").fill("Top products by revenue");
  await page.getByTestId("ask-submit").click();
  await expect(page.getByTestId("ask-result")).toBeVisible();
  await page.waitForTimeout(5000);

  await page.getByRole("button", { name: "North America" }).click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo({ top: 1200, behavior: "smooth" }));
  await page.waitForTimeout(6000);
  await page.getByRole("button", { name: "Customers by plan tier" }).click();
  await expect(page.getByTestId("ask-result")).toBeVisible();
  await page.waitForTimeout(6000);
});
