# 极限之上（Beyond the limits）· 汉化版

## 汉化说明

本项目已内置中文，译文来自林雷（LinLei_Baruch）的油猴汉化脚本，并补全了原脚本未覆盖的无限层内容（永恒字母、灾厄层级、宇宙、超新星、幻境等）。

- 汉化实现位于 `src/localization/`：`dictionary.ts` 为原脚本字典与规则，`extra.ts` 为新增译文与术语兜底，`index.ts` 为运行时翻译引擎。
- 只替换界面显示文本，不修改游戏状态、存档键名或数值逻辑，因此与英文版存档完全兼容。
- 默认开启汉化。如需临时切回英文，可在浏览器控制台执行 `setChineseTranslation(false)`；恢复执行 `setChineseTranslation(true)`。切换后页面会刷新。
- 构建与运行：`npm install` → `npm run dev`（开发）/ `npm run build`（构建）。

---

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
