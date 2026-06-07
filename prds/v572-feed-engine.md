# PRD: PixelPal V572 — Chatdev Feed Engine (Direction C Iteration 77)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-303 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v572-feed-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 77 = Feed Engine**，来源：chatdev-design。

本迭代实现信息流引擎：添加、发布、阅读、暂停、归档、统计（3 种状态：active/paused/archived）。

## 功能规格

### 1. 信息流引擎架构

```
FeedAdder → Publisher → Reader → Pauser/Archiver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fde/FeedEngine.ts` | 信息流引擎 |
| `src/fde/__tests__/FeedEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type FeedStatus = 'active' | 'paused' | 'archived';

class FeedEngine {
  add(title: string, body: string): string;
  publish(id: string): boolean;
  read(id: string): boolean;
  pause(id: string): boolean;
  archive(id: string): boolean;
  getStats(): { items: number; totalAdded: number; totalPublished: number; totalRead: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fde/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fde/__tests__/FeedEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v572-feed-engine` 分支