# CLAUDE.md - AI Prompt 管理平台

## 项目概述

这是一个基于 Nuxt 4 的 AI Prompt 管理与分享平台，支持提示词的创建、编辑、版本管理、标签分类和公开分享。

## 技术栈

- **前端**: Nuxt 4.2 + Vue 3.5 + Nuxt UI 4 + Tailwind CSS 4
- **后端**: Nitro (Nuxt Server Engine), 文件路由 API
- **数据库**: MySQL 8 + Drizzle ORM
- **ID 生成**: Snowflake ID (BigInt)
- **验证**: Zod
- **认证**: Cookie Session + Linux DO OAuth2
- **部署**: Docker + Docker Compose, Gitea CI/CD
- **包管理器**: pnpm 9
- **运行时**: Node.js 20+

## 项目结构

```
app/                    # 前端代码
  components/           # Vue 组件 (PascalCase)
  composables/          # 组合式函数 (useXxx)
  layouts/              # 布局组件
  middleware/           # 路由中间件
  pages/                # 页面路由 (文件路由)
  plugins/              # 插件
server/                 # 后端代码
  api/                  # API 路由 (文件路由, RESTful)
  database/schema.ts    # Drizzle 数据库 Schema
  middleware/           # 服务端中间件
  utils/                # 工具函数
scripts/                # 数据库脚本
drizzle/                # 数据库迁移文件
```

## 常用命令

```bash
pnpm dev              # 启动开发服务器 (port 8002)
pnpm build            # 生产构建
pnpm preview          # 预览生产构建
pnpm drizzle-kit push # 同步数据库 Schema
```

## 编码规范

### 命名约定
- Vue 组件: PascalCase (`PromptForm.vue`)
- 页面: kebab-case 目录 + index/[param] 文件
- API 路由: `resource.method.ts` (如 `prompts.get.ts`)
- Composables: `useXxx` 命名模式
- 数据库表: 复数小写 (users, prompts, tags)
- TypeScript 字段: camelCase

### 前端规范
- 使用 `<script setup lang="ts">` 组合式 API
- 使用 `ref()`, `reactive()`, `computed()` 响应式状态
- 使用 Nuxt UI 组件库 (UButton, UInput, UCard 等)
- 使用 Heroicons 图标 (`i-heroicons-xxx`)
- 支持深色模式 (`dark:` Tailwind 前缀)
- 表单验证使用 Zod Schema
- Toast 通知使用 `useAppToast()` composable
- 响应式网格布局 (1 col mobile → 4 cols desktop)

### 后端规范
- API 使用 Nitro 文件路由，RESTful 风格
- 请求验证使用 Zod，在处理前校验
- 错误响应格式: `{ statusCode, statusMessage, data? }`
- 成功响应格式: `{ success: true, data }`
- 认证: `getCookie(event, 'auth_token')` 获取会话
- BigInt ID 序列化为字符串传输
- 使用连接池管理数据库连接 (max 10)

### 数据库规范
- 所有表使用 Snowflake ID 作为主键 (BigInt)
- 时间字段使用 `timestamp` 自动默认值
- tags 字段使用 JSON 类型存储数组
- promptVersions 表保存历史版本快照

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `POST /api/auth/change-password` - 修改密码
- `GET /api/auth/login/linuxdo` - OAuth 跳转
- `GET /api/auth/callback/linuxdo` - OAuth 回调

### 提示词
- `GET /api/prompts` - 列表 (分页, 按时间倒序)
- `POST /api/prompts` - 创建
- `GET /api/prompts/[id]` - 详情 (含最新版本变更日志)
- `PUT /api/prompts/[id]` - 更新 (自动版本管理)
- `DELETE /api/prompts/[id]` - 删除
- `GET /api/prompts/[id]/versions` - 版本历史

### 标签
- `GET /api/tags?q=` - 列表 (支持搜索)
- `POST /api/tags` - 创建
- `DELETE /api/tags/[id]` - 删除

## 环境变量

参考 `.env.example` 文件配置以下变量:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL 连接
- `NUXT_SESSION_PASSWORD` - 会话加密密钥 (≥32 字符)
- `LINUX_DO_CLIENT_ID`, `LINUX_DO_CLIENT_SECRET`, `LINUX_DO_CALLBACK_URL` - OAuth (可选)

## 注意事项

- 项目语言为中文，UI 文案使用中文
- 无测试框架，修改代码后需手动验证
- 密码使用 SHA256 哈希存储
- 使用 `useLocalStorage` 在浏览器本地保存用户配置
- 提示词内容支持 `{{变量}}` 模板语法
- 版本号遵循 SemVer 语义化版本
