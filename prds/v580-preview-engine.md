# PRD: PixelPal V580 — Claude Code Preview Engine (Direction A Iteration 79)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-320 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v580-preview-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 79 = Preview Engine**，来源：claude-code-design。

本迭代实现预览引擎：创建、渲染、统计（4 种格式：text/markdown/html/json）。

## 功能规格

### 1. 预览引擎架构

```
PreviewCreator → Renderer → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pve/PreviewEngine.ts` | 预览引擎 |
| `src/pve/__tests__/PreviewEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PreviewFormat = 'text' | 'markdown' | 'html' | 'json';

class PreviewEngine {
  create(title: string, content: string, format: PreviewFormat): string;
  render(id: string): string | null;
  remove(id: string): boolean;
  getStats(): { previews: number; totalAdded: number; totalRendered: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pve/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pve/__tests__/PreviewEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v580-preview-engine` 分支