import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '78长度测量仪',
  description: '科幻风格的趣味长度测量工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="scan-line"></div>
        <div className="cyber-grid min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}