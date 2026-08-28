import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 产出自包含 Node server 到 .next/standalone（容器化运行，镜像精简）
  output: "standalone",
};

export default nextConfig;
