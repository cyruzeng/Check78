# 78 长度测量仪

量子科幻风格的“78 长度测量仪”，基于 Next.js 14 与 PostgreSQL（Prisma）构建。支持随机测量、排行榜、灰色幽默评价、彩蛋触发以及管理员后台管理功能，可部署到 Vercel。

## 功能总览

- 输入任意名字获取 1–25 的随机长度值，并附带灰色幽默评价（每 5 为一个区间）。
- 同名再次查询时返回固定历史结果。
- 支持自定义彩蛋（返回 -9999 / 9999 等特殊值）。
- 排行榜（正序 / 倒序），用户可选择上传结果。
- 用户协议门禁：接受协议后才可进入测量页面。
- 管理端：首次访问要求初始化管理员账户；之后可登录查看 & 修改测量记录、维护彩蛋、管理违禁字符串。
- 全局科幻风格界面与动画交互，使用 Tailwind CSS + Framer Motion。

## 开发环境

```bash
npm install
npx prisma generate
npm run dev
```

项目默认监听 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

- `DATABASE_URL`：PostgreSQL 连接字符串（Vercel 推荐使用 Neon 或 Supabase）。
- 其余变量按需补充。

## Prisma 数据库

1. 修改 `DATABASE_URL` 后执行迁移：
   ```bash
   npx prisma migrate dev --name init
   ```
   部署到生产环境后，可使用：
   ```bash
   npm run prisma:deploy
   ```

2. 若需使用 Prisma Studio：
   ```bash
   npm run prisma:studio
   ```

## 管理端说明

- 首次部署后访问 `/admin`，按照提示设置管理员用户名与密码。
- 之后使用配置好的账号登录，即可执行：修改测量结果、添加/删除彩蛋、添加/删除违禁字符串。
- 后端使用 Zod 校验输入、标准化字符串并限制 SQL 注入；管理员会话自动在数据库中维护并定期续期。

## 部署到 Vercel

1. 在 Vercel 导入仓库后，设置环境变量 `DATABASE_URL` 与 `ADMIN_TOKEN`。
2. 在 “Build & Output” 设置中，保证安装 & 构建命令分别为：
   - Install: `npm install`
   - Build: `npm run build`
3. 部署后，在 “Settings → Environment Variables” 中新增 `DATABASE_URL`（需保证数据库对 Vercel 可访问）。
4. 首次部署后在本地或 Vercel（使用 Vercel CLI 或 GitHub Action）执行 `npm run prisma:deploy` 应用迁移。

## 代码结构

- `app/`：Next.js App Router 页面与 API Route。
- `components/`：前端组件（包括科幻风 UI、排行榜、管理员后台）。
- `lib/`：通用工具，如 Prisma 客户端与业务逻辑函数。
- `prisma/`：Prisma schema 定义。

## 许可

此项目默认采用 MIT License，可根据实际需求调整。
