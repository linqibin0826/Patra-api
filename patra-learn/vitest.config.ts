// 单测只测 .ts 纯逻辑（content/lib），node 环境即可
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig 为 Next 设了 jsx: preserve；测试经由注册表引到 .tsx，需 oxc 实际转译 JSX
  oxc: { jsx: { runtime: "automatic" } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
