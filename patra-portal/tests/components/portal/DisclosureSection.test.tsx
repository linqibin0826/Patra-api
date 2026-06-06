import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DisclosureSection } from "@/components/portal/DisclosureSection";

describe("DisclosureSection", () => {
  it("默认收起：aria-expanded=false，body 隐藏", () => {
    render(
      <DisclosureSection title="完整评级明细">
        <p>评级内容</p>
      </DisclosureSection>,
    );
    expect(screen.getByRole("button", { name: /完整评级明细/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByText("评级内容")).not.toBeVisible();
  });

  it("defaultOpen：aria-expanded=true，body 可见", () => {
    render(
      <DisclosureSection title="完整评级明细" defaultOpen>
        <p>评级内容</p>
      </DisclosureSection>,
    );
    expect(screen.getByRole("button", { name: /完整评级明细/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("评级内容")).toBeVisible();
  });

  it("点击在展开/收起间切换", async () => {
    const user = userEvent.setup();
    render(
      <DisclosureSection title="文献计量与趋势">
        <p>趋势内容</p>
      </DisclosureSection>,
    );
    const btn = screen.getByRole("button", { name: /文献计量与趋势/ });
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("趋势内容")).toBeVisible();
    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("趋势内容")).not.toBeVisible();
  });
});
