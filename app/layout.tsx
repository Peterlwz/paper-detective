import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "论文侦探 Paper Detective",
  description: "把复杂论文变成一场证据推理游戏。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
