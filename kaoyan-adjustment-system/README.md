# 考研调剂信息展示系统（含用户权限控制）

## 项目简介

本项目包含：

- 后端：Cloudflare Workers + D1（`backend-worker/`）
- 前端：纯静态 HTML/CSS/JS + ECharts（`frontend/`）

已实现能力：

- 用户登录（`users` 表 + bcrypt 密码校验 + JWT 7 天有效期）
- 账号过期校验（`expire_date` 到期后禁止登录与访问）
- 学生数据查询（筛选、排序、稳定游标分页）
- 权限隔离（普通用户按 `allowed_major_prefixes` 自动过滤 `students.major_code`）
- 管理员用户管理（`/api/users` 增删改查）
- 前端角色分栏（普通用户查询页；管理员额外拥有用户管理页）

---

## 目录结构

```text
kaoyan-adjustment-system/
├─ backend-worker/
│  ├─ package.json
│  ├─ wrangler.toml
│  └─ src/
│     └─ index.js
├─ frontend/
│  └─ index.html
└─ README.md
```

---

## 后端接口

统一返回格式：

```json
{
  "success": true,
  "message": "xxx",
  "data": {}
}
```

### 认证

- `POST /api/login`
  - 入参：`{ username, password }`
  - 行为：bcrypt 校验 + 账号过期检查
  - 返回：`token`、`expires_in_days`、`user`

### 学生查询

- `GET /api/students`（需 Bearer Token）
  - 筛选参数：
    - `year, school, region, school_category, college, major_code, major_prefix, major_name, study_form, student_id, first_choice_school, min_score, max_score`
  - 排序参数：`order_by`、`order`
  - 分页参数：`cursor`、`page_size`
  - 权限：
    - `admin`：不受专业前缀限制
    - `user`：自动追加 `major_code LIKE 'prefix%'` 权限过滤

### 统计

- `GET /api/stats`（需 Bearer Token）
  - 返回总分 10 分桶、按年份人数
  - 同样受专业前缀权限过滤

### 管理员接口（仅 `role=admin`）

- `GET /api/users`：用户列表（不返回密码哈希）
- `POST /api/users`：创建用户（明文密码会后端哈希）
- `PUT /api/users/:id`：更新用户（密码可选）
- `DELETE /api/users/:id`：删除用户（禁止删除当前登录用户）

---

## 部署后端 Worker

### 1) 安装依赖

```bash
cd backend-worker
npm install
```

### 2) 配置 D1

编辑 `backend-worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "students-db"
database_id = "YOUR_D1_DATABASE_ID"
```

### 3) 配置环境变量

当前使用：

- `JWT_SECRET`
- `CORS_ORIGIN`
- `BCRYPT_SALT_ROUNDS`（默认示例 `10`）

推荐用 secret：

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put CORS_ORIGIN
```

### 4) 本地调试与部署

```bash
npm run dev
npm run deploy
```

---

## users 表与初始化管理员

你已创建 `users` 表，字段为：

- `id, username, password_hash, role, expire_date, allowed_major_prefixes`

可先生成 bcrypt 哈希，再插入管理员账户。

示例（Node.js）：

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('your_password',10))"
```

将输出哈希写入 D1：

```sql
INSERT INTO users (username, password_hash, role, expire_date, allowed_major_prefixes)
VALUES ('admin', '$2a$10$......', 'admin', NULL, NULL);
```

---

## 部署前端到 GitHub Pages

1. 将 `frontend/` 推送到前端仓库。
2. 在 GitHub Pages 启用该仓库分支。
3. 打开页面后填入 Worker URL 并保存。
4. 使用 `users` 表中的账号登录。

---

## CSV 导入 students（后续）

`students` 表已存在，可继续使用你后续提供的 Python 脚本批量导入。

导入后可验证：

```bash
npx wrangler d1 execute students-db --command "SELECT COUNT(*) FROM students;"
```

---

## 说明（关于 1 天/7 天）

当前实现固定 JWT 有效期为 7 天（后端设置），前端不提供会话时长选择控件。  
如果你后续需要“登录时选择 1 天/7 天”，可以在登录接口增加 `session_days` 参数并动态设置 token `exp`。
