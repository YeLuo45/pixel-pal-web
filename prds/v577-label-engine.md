# PRD: PixelPal V577 — Chatdev Label Engine (Direction C Iteration 78)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-309 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v577-label-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 78 = Label Engine**，来源：chatdev-design。

本迭代实现标签引擎：添加、打标签、取消标签、统计（6 种颜色：red/blue/green/yellow/purple/orange）。

## 功能规格

### 1. 标签引擎架构

```
LabelAdder → Tagger → Untagger
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/lbe/LabelEngine.ts` | 标签引擎 |
| `src/lbe/__tests__/LabelEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type LabelColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

class LabelEngine {
  add(name: string, color: LabelColor): string;
  tag(id: string): boolean;
  untag(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { labels: number; totalAdded: number; totalTagged: number; totalUntagged: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/lbe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/lbe/__tests__/LabelEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v577-label-engine` 分支