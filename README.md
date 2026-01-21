# 🚀 Prompt 管理平台

一个现代化的 AI Prompt 管理与分享平台，基于 **Nuxt 4** 全栈框架构建。

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql)

## ✨ 功能特性

- 📝 **Prompt 管理** - 创建、编辑、版本控制您的 AI Prompts
- 🏷️ **标签系统** - 灵活的标签分类与筛选
- 🔐 **多种登录方式** - 支持邮箱注册及 Linux DO Connect 第三方登录
- 🌙 **深色模式** - 自动适配系统主题
- 📱 **响应式设计** - 完美适配桌面与移动端

## 🛠️ 技术栈

| 层级       | 技术                                       |
| ---------- | ------------------------------------------ |
| **前端**   | Nuxt 4, Vue 3, Nuxt UI, Tailwind CSS       |
| **后端**   | Nitro (Nuxt Server Engine)                 |
| **数据库** | MySQL 8.x + Drizzle ORM                    |
| **认证**   | Cookie Session + OAuth2 (Linux DO Connect) |
| **部署**   | Docker + Docker Compose                    |

## 📦 快速开始

### 环境要求

- Node.js 20+
- pnpm (推荐) 或 npm
- MySQL 8.x

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/your-username/prompt-platform.git
cd prompt-platform

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 填入您的数据库配置

# 4. 同步数据库结构
pnpm drizzle-kit push

# 5. 启动开发服务器
pnpm dev
```

访问 http://localhost:8002 开始使用！

## ⚙️ 环境变量

| 变量名                   | 必填 | 说明                          |
| ------------------------ | ---- | ----------------------------- |
| `DB_HOST`                | ✅   | MySQL 主机地址                |
| `DB_PORT`                | ❌   | MySQL 端口 (默认 3306)        |
| `DB_USER`                | ✅   | 数据库用户名                  |
| `DB_PASSWORD`            | ✅   | 数据库密码                    |
| `DB_NAME`                | ✅   | 数据库名称                    |
| `NUXT_SESSION_PASSWORD`  | ✅   | Session 加密密钥 (至少 32 位) |
| `LINUX_DO_CLIENT_ID`     | ❌   | Linux DO OAuth Client ID      |
| `LINUX_DO_CLIENT_SECRET` | ❌   | Linux DO OAuth Client Secret  |
| `LINUX_DO_CALLBACK_URL`  | ❌   | OAuth 回调地址                |

## 🐳 Docker 部署

```bash
# 使用 Docker Compose 一键部署
docker compose up -d
```

确保在运行前已配置好 `.env` 文件。

## 📁 项目结构

```
├── app/                  # 前端代码
│   ├── components/       # Vue 组件
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面路由
│   └── composables/      # 组合式函数
├── server/               # 后端代码
│   ├── api/              # API 路由
│   ├── database/         # 数据库 Schema
│   ├── middleware/       # 中间件
│   └── utils/            # 工具函数
├── drizzle/              # 数据库迁移文件
└── public/               # 静态资源
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/your-username">Your Name</a>
</p>
