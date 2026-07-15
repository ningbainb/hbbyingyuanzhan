# 憨宝宝的小宇宙 · HanBaby Fan Universe

粉丝应援站 **纯静态单页**（移动端优先），可直接部署到 **GitHub Pages**。

> 十万份喜欢，汇成一颗只为憨宝宝闪耀的星。

## 在线预览（本地）

```bash
# 进入项目目录后
python -m http.server 5173
# 浏览器打开 http://localhost:5173
```

不要用 `file://` 直接双击打开来测下载功能（部分浏览器会拦截 fetch/download）。

---

## 部署到 GitHub Pages

### 1. 创建仓库并推送

在 GitHub 新建**公开**仓库（例如 `hbbyingyuanzhan`），然后在本机项目目录执行：

```bash
git init
git add index.html css js assets README.md .gitignore
git commit -m "feat: static HanBaby fan site for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 打开 Pages

1. 打开仓库 → **Settings** → **Pages**
2. **Source** 选 `Deploy from a branch`
3. Branch 选 `main`，目录选 `/ (root)`
4. 保存后等待 1～2 分钟

访问地址一般为：

```text
https://<你的用户名>.github.io/<仓库名>/
```

> 本站资源全部使用**相对路径**，放在子路径仓库下也能正常加载。

### 3. 可选：用户主页站点

若仓库名是 `<用户名>.github.io`，则页面地址为：

```text
https://<用户名>.github.io/
```

---

## 纯静态下：哪些能用 / 哪些不能

| 功能 | 状态 | 说明 |
|------|------|------|
| 浏览页面、动画、作品筛选 | ✅ 可用 | 纯前端 |
| 时间线 / 创作馆 / 关于 | ✅ 可用 | 静态内容 |
| 素材下载 | ✅ 可用 | 通过 fetch 触发下载；失败则新窗口打开图片 |
| 每日任务（本机勾选） | ⚠️ 本机 | 记录在浏览器 localStorage |
| 爱心值 / 应援积分 | ⚠️ 本机 | 不跨设备、不共享 |
| 送祝福进度 | ⚠️ 本机 | 演示数字，非全站统计 |
| 留言墙提交 | ⚠️ 本机 | **只有你自己看得到**，不会上传服务器 |
| 游客加入憨家军 | ⚠️ 本机 | 无真实账号/登录 |
| 应援纪念榜 | 📦 演示 | 前端写死的示例数据 |
| 全站实时留言/审核 | ❌ 需后端 | 需接入 Supabase / 云函数等 |
| 真实抖音作品流 | ❌ 需对接 | 无抖音开放接口嵌入 |
| 粉丝共创上传 | ❌ 需后端 | 纯静态无法存文件 |
| 全站排行榜同步 | ❌ 需后端 | — |

顶部有**纯静态站点**提示条，可关闭（当前会话内记住）。

---

## 目录结构

```text
hbbyingyuanzhan/
├── index.html          # 入口
├── css/style.css       # 样式
├── js/main.js          # 交互（localStorage）
├── assets/             # 正式使用的图片
├── .gitignore
└── README.md
```

---

## 设计说明

- 主色：樱花粉 `#FFB7D5`、薰衣草紫 `#CBB8FF`、梦幻紫 `#A98AE8`
- 气质：甜酷、软萌、手绘感
- 详细方案见：`憨宝宝主播应援网站设计方案.md`（可选，不必部署）

---

## 以后若要「真·全站功能」

可在保持静态前端的前提下接入：

- **Supabase / Firebase**：留言、进度、登录
- **Formspree / 飞书多维表格**：轻量投稿
- **自建 API**（Cloudflare Workers 等）

当前版本刻意做成 **零后端、可免费托管** 的 GitHub Pages 友好形态。
