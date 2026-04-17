# PixelPal Web

AI 桌面宠物与工作助手。

## 功能特性

- **PixelPal 宠物**: 可视化的 AI 伙伴
- **任务管理**: 任务面板 + 看板视图
- **日历**: 日历视图与日程管理
- **邮件**: Gmail 邮件查看与回复
- **AI 聊天**: ChatPanel 多功能 AI 对话
- **文档解析**: 支持 PDF、Word、Excel 文档解析
- **设置**: 灵活的个性化配置

## 技术栈

- React 19 + TypeScript
- Vite (构建工具)
- Electron (Windows 桌面客户端)
- Zustand (状态管理)
- MUI (Material UI) + Emotion
- pdfjs-dist, mammoth, xlsx (文档解析)
- date-fns, react-router-dom, uuid

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
# Web 构建
npm run build

# Electron 桌面客户端
npm run package
```

## 部署

- Web: GitHub Pages (https://YeLuo45.github.io/pixel-pal-web)
- Electron: Windows NSIS 安装包 (release 目录)
