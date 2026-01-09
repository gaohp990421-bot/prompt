import { mysqlTable, bigint, varchar, text, timestamp, json } from 'drizzle-orm/mysql-core'

// 定义 Prompts 表结构
export const prompts = mysqlTable('prompts', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),     // 雪花 ID (BigInt)
  userId: bigint('user_id', { mode: 'bigint' }).notNull(), // 用户 ID
  title: varchar('title', { length: 255 }).notNull(),    // 提示词标题
  content: text('content').notNull(),                    // 提示词内容
  description: text('description'),                      // 描述
  tags: json('tags'),                                    // 标签 (JSON array)
  version: varchar('version', { length: 50 }).default('1.0.0'), // 版本
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
})

// 定义 Users 表结构
export const users = mysqlTable('users', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),     // 雪花 ID (BigInt)
  email: varchar('email', { length: 255 }).notNull().unique(), // 邮箱
  password: varchar('password', { length: 255 }),                // 密码 (新增)
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
})

// 定义 Tags 表结构
export const tags = mysqlTable('tags', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),     // 雪花 ID (BigInt)
  userId: bigint('user_id', { mode: 'bigint' }).notNull(), // 用户 ID
  name: varchar('name', { length: 50 }).notNull(),       // 标签名称
  createdAt: timestamp('created_at').defaultNow().notNull(), // 创建时间
})

// 定义 PromptVersions 表结构 (历史版本)
export const promptVersions = mysqlTable('prompt_versions', {
  id: bigint('id', { mode: 'bigint' }).primaryKey(),           // 雪花 ID
  promptId: bigint('prompt_id', { mode: 'bigint' }).notNull(), // 关联的 Prompt ID
  version: varchar('version', { length: 50 }).notNull(),       // 版本号 (e.g., 1.0.0)
  title: varchar('title', { length: 255 }).notNull(),          // 标题快照
  content: text('content').notNull(),                          // 内容快照
  description: text('description'),                            // 描述快照
  changelog: text('changelog'),                                // 版本更新日志
  tags: json('tags'),                                          // 标签快照
  createdAt: timestamp('created_at').defaultNow().notNull(),   // 创建时间
})
