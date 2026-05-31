import { expect, test } from "@playwright/test";

test("homepage smoke — 结构区块 + 文献流 tab", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("可被检索");

  // 文献流区块存在（无论数据有无 / 后端是否在线）
  const feed = page.locator("[data-section='explore-feed']");
  await expect(feed).toBeVisible();

  // 两个 tab 控件始终渲染
  await expect(feed.getByRole("tab", { name: "最近更新" })).toBeVisible();
  await expect(feed.getByRole("tab", { name: "高被引" })).toBeVisible();

  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("切 tab 改 URL searchParam", async ({ page }) => {
  await page.goto("/");
  const feed = page.locator("[data-section='explore-feed']");
  await feed.getByRole("tab", { name: "高被引" }).click();
  await expect(page).toHaveURL(/[?&]tab=cited/);
});
