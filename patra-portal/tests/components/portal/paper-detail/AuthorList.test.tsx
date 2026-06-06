import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { AuthorList } from "@/components/portal/paper-detail/AuthorList";

describe("AuthorList", () => {
  it("渲染作者名 + 通讯/第一作者徽记 + 机构", () => {
    render(
      <AuthorList
        authors={[
          {
            order: 1,
            first: true,
            corresponding: true,
            name: "Zhang San",
            affiliation: "Peking U",
          },
        ]}
      />,
    );
    expect(screen.getByText("Zhang San")).toBeInTheDocument();
    expect(screen.getByText("第一作者")).toBeInTheDocument();
    expect(screen.getByText(/通讯/)).toBeInTheDocument();
    expect(screen.getByText("Peking U")).toBeInTheDocument();
  });
});
