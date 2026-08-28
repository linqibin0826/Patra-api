import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-sc",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Patra 学习站",
  description: "把你的系统，一条线一条线学明白",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSc.variable} ${jetbrainsMono.variable} bg-bg font-sans text-ink antialiased`}
      >
        <TopBar />
        {children}
      </body>
    </html>
  );
}
