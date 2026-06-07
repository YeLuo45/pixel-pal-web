# PRD: PixelPal V585 — Claude Code Anchor Engine (Direction A Iteration 80)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-340 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v585-anchor-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 80 = Anchor Engine**，来源：claude-code-design。

本迭代实现锚点引擎：添加、链接、取消链接、统计（6 种 kind：h1/h2/h3/span/div/section）。

## 功能规格

### 1. 锚点引擎架构

```
AnchorAdder → Linker → Unlinker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ane/AnchorEngine.ts` | 锚点引擎 |
| `src/ane/__tests__/AnchorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type AnchorKind = 'h1' | 'h2' | 'h3' | 'span' | 'div' | 'section';

class AnchorEngine {
  add(name: string, href: string, kind: AnchorKind): string;
  link(id: string): boolean;
  unlink(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { anchors: number; totalAdded: number; totalLinked: number; totalUnlinked: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ane/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ane/__tests__/AnchorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v585-anchor-engine` 分支