# 78长度测量仪

一个科幻风格的趣味长度测量工具，基于 NextJS、Vercel 和 Supabase 构建。

## 🚀 功能特性

### 核心功能
- **78维度长度测量**：输入任意字符串，获得1-25的固定长度值
- **一致性保证**：相同输入始终返回相同结果
- **灰色幽默评价**：基于长度区间的科幻风格评价系统
- **排行榜系统**：用户可选择提交结果到排行榜
- **双序排行**：支持正序和倒序排行显示

### 特殊功能
- **神秘彩蛋**：特殊名称触发-9999和9999的极端值
- **管理员后台**：完整的后台管理系统
- **安全防护**：防注入和内容过滤
- **用户协议**：使用前需确认的用户协议

### 视觉体验
- **科幻风格**：赛博朋克主题的UI设计
- **动画效果**：丰富的CSS动画和过渡效果
- **响应式设计**：适配各种设备尺寸
- **高交互性**：流畅的用户交互体验

## 🛠 技术栈

- **前端框架**：NextJS 14 (App Router)
- **样式系统**：Tailwind CSS + 自定义CSS
- **数据库**：Supabase (PostgreSQL)
- **部署平台**：Vercel
- **编程语言**：TypeScript

## 📦 安装和运行

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd length-measurer
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境变量配置**
   创建 `.env.local` 文件，添加以下变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ADMIN_PASSWORD=your_admin_password
   ```

4. **数据库设置**
   在 Supabase 中创建以下表结构：
   
   **measurements 表**
   ```sql
   CREATE TABLE measurements (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(50) NOT NULL,
     length INTEGER NOT NULL CHECK (length >= -9999 AND length <= 9999),
     evaluation TEXT NOT NULL,
     ip_address INET,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **rankings 表**
   ```sql
   CREATE TABLE rankings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(50) NOT NULL,
     length INTEGER NOT NULL CHECK (length >= -9999 AND length <= 9999),
     ip_address INET,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **forbidden_strings 表**
   ```sql
   CREATE TABLE forbidden_strings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     string VARCHAR(100) NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **easter_eggs 表**
   ```sql
   CREATE TABLE easter_eggs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(50) NOT NULL UNIQUE,
     length INTEGER NOT NULL CHECK (length >= -9999 AND length <= 9999),
     message TEXT NOT NULL,
     is_special BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **admin_config 表**
   ```sql
   CREATE TABLE admin_config (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     forbidden_strings TEXT[] DEFAULT '{}',
     easter_eggs JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 `http://localhost:3000`

### 生产部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到 Vercel**
   - 连接 GitHub 仓库到 Vercel
   - 配置环境变量
   - 自动部署

## 🎯 使用说明

### 普通用户
1. 访问应用主页
2. 阅读并同意用户协议
3. 输入任意字符串进行测量
4. 查看测量结果和评价
5. 可选择提交到排行榜
6. 查看排行榜排名

### 管理员
1. 访问 `/admin` 路径
2. 输入管理员密码登录
3. 管理已收录的字符串和对应长度
4. 管理违禁词列表
5. 自定义彩蛋内容和触发条件

## 🔧 API 接口

### 测量接口
- **POST /api/measure**
  - 请求体：`{ name: string }`
  - 返回：`{ success: boolean, data: MeasurementResult }`

### 排行榜接口
- **GET /api/ranking**
  - 返回：`{ success: boolean, data: RankingItem[] }`
  
- **POST /api/ranking**
  - 请求体：`{ name: string, length: number }`
  - 返回：`{ success: boolean }`

### 管理接口
- **GET /api/admin/strings**
- **POST /api/admin/strings**
- **PUT /api/admin/strings/:id**
- **DELETE /api/admin/strings/:id**

## 🎨 设计特色

### 科幻风格
- 赛博朋克配色方案
- 霓虹灯效果
- 网格背景动画
- 扫描线效果

### 交互设计
- 流畅的页面过渡
- 悬停动画效果
- 加载状态指示
- 响应式布局

## 🛡 安全特性

- **输入验证**：严格的输入验证和清理
- **防注入**：防止SQL注入和XSS攻击
- **内容过滤**：违禁词检测和过滤
- **IP记录**：用于安全防护的IP地址记录

## 📊 性能优化

- **代码分割**：按需加载组件
- **图片优化**：使用 NextJS 图片优化
- **缓存策略**：合理的缓存配置
- **数据库索引**：优化的数据库查询

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🆘 支持

如遇到问题，请：
1. 查看文档和常见问题
2. 在 Issues 中搜索类似问题
3. 创建新的 Issue 描述问题

---

**享受测量的乐趣吧！** 🚀