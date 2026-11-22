# 极限之上（Beyond the limits）· 汉化版

## 汉化说明

本项目已内置中文，译文来自林雷（LinLei_Baruch）的油猴汉化脚本，并补全了原脚本未覆盖的无限层内容（永恒字母、灾厄层级、宇宙、超新星、幻境等）。

- 汉化实现位于 `src/localization/`：`dictionary.ts` 为原脚本字典与规则，`extra.ts` 为新增译文与术语兜底，`index.ts` 为运行时翻译引擎。
- 只替换界面显示文本，不修改游戏状态、存档键名或数值逻辑，因此与英文版存档完全兼容。
- 默认开启汉化。如需临时切回英文，可在浏览器控制台执行 `setChineseTranslation(false)`；恢复执行 `setChineseTranslation(true)`。切换后页面会刷新。
- 构建与运行：`npm install` → `npm run dev`（开发）/ `npm run build`（构建）。
- **不要直接双击打开 `index.html`**：Vite 使用 ES 模块，`file://` 协议会触发 CORS 拦截，且 `/femmylogo.png` 会被解析成磁盘根目录路径而 404。必须通过本地 HTTP 服务访问。

## 本地测试

```bash
npm install
npm run dev
```

然后打开终端输出的地址（本仓库 `vite.config.ts` 的 `base` 设为 `/Beyond-the-limits/`，通常是 http://localhost:5173/Beyond-the-limits/ ）。

测试构建产物：

```bash
npm run build
npm run preview
```

再打开预览服务给出的地址（如 http://localhost:4173/Beyond-the-limits/）；不要直接用浏览器打开 `dist/index.html`。

## 在线部署

`.github/workflows/deploy.yml` 会在推送到 `main` 后自动构建 `dist` 并发布到 GitHub Pages。Pages 设置需选择「GitHub Actions」作为构建来源。站点地址：https://linlei0102.github.io/Beyond-the-limits/

---

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
