// patra-learn/tests/smoke.spec.ts
import { expect, test } from "@playwright/test";

test("首页渲染 13 个开通站节点", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("station-node")).toHaveCount(13);
  await expect(page.getByTestId("progress-badge")).toContainText("0 / 13");
});

test("打卡后首页点亮且刷新保持", async ({ page }) => {
  await page.goto("/lines/l1/write-code");
  await page.getByTestId("check-in").click();
  await expect(page.getByTestId("check-in")).toContainText("已学完");
  await page.goto("/");
  await expect(page.getByTestId("progress-badge")).toContainText("1 / 13");
  await expect(page.locator('[data-testid="station-node"][data-visited]')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('[data-testid="station-node"][data-visited]')).toHaveCount(1);
});

test("图鉴搜索过滤生效", async ({ page }) => {
  await page.goto("/glossary");
  await expect(page.getByTestId("glossary-card")).toHaveCount(10);
  // "runner" 仅命中 runner 词条本身（term/analogy/explain 三字段中其余词条均不含该词）
  await page.getByTestId("glossary-search").fill("runner");
  await expect(page.getByTestId("glossary-card")).toHaveCount(1);
});
