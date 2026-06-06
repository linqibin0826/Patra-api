import { expect, test } from "@playwright/test";

test("explore-feed 点文献 → 跳转详情页并渲染摘要区", async ({ page }) => {
  await page.goto("/");
  const links = page.getByRole("link", { name: "详情" });
  // explore-feed 由 RSC fetchFeed 取自后端；无可达后端时（纯前端 portal-ci 的 e2e job）
  // 首页渲染不出文献卡。该 happy-path 依赖服务端取数，故无卡时跳过，留给有后端的本地/staging e2e。
  test.skip(
    (await links.count()) === 0,
    "explore-feed 无文献卡（后端不可达）：跳过 happy-path e2e",
  );

  const first = links.first();
  await expect(first).toBeVisible();
  await first.click();

  await expect(page).toHaveURL(/\/papers\/\d+/);

  // 若 catalog 服务返回 500，详情页不可用——与无文献卡同属「后端不可达」场景，跳过。
  // 等待 h1 渲染后再判断（RSC 流式渲染需要短暂等待）。
  await page.waitForSelector("h1", { timeout: 5000 }).catch(() => null);
  const h1Text = await page
    .getByRole("heading", { level: 1 })
    .textContent()
    .catch(() => "");
  test.skip(h1Text === "这一页没能加载出来", "catalog 服务 500（后端不可达）：跳过 happy-path e2e");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/.+/);
  await expect(page.getByRole("region", { name: "摘要" })).toBeVisible();
});

test("非数字 id → not-found 页", async ({ page }) => {
  await page.goto("/papers/not-a-real-id");
  await expect(page.getByRole("heading", { name: "没有这一页" })).toBeVisible();
  await expect(page.getByText(/这篇文献不在 Patra/)).toBeVisible();
});
