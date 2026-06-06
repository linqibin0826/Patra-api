import { expect, test } from "@playwright/test";

test("首页点期刊卡 → 跳转详情页并渲染核心区块", async ({ page }) => {
  await page.goto("/");
  const journalsSection = page.locator('[data-section="journals"]');
  const firstCard = journalsSection.getByRole("link").first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();

  await expect(page).toHaveURL(/\/journals\/\d+/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/.+/);
  await expect(page.getByText(/深度数据/)).toBeVisible();
  await expect(page.getByRole("button", { name: /完整评级明细/ })).toBeVisible();
});

test("非数字 id → not-found 页", async ({ page }) => {
  await page.goto("/journals/not-a-real-id");
  await expect(page.getByRole("heading", { name: "没有这一页" })).toBeVisible();
  await expect(page.getByText(/这本期刊不在 Patra/)).toBeVisible();
});
