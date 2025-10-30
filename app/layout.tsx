import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "78长度测量仪",
  description: "量子科幻风的78长度测量仪与排行榜"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-star-field" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-b from-slate-950 via-slate-900/70 to-slate-950 opacity-80" />
          <div className="absolute inset-x-0 top-0 -z-10 h-72 animate-drift bg-[radial-gradient(circle,rgba(56,189,248,0.4),transparent_70%)] blur-3xl" />
          {children}
        </div>
      </body>
    </html>
  );
}
