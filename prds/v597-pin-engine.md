# PRD: PixelPal V597 — Chatdev Pin Engine (Direction C Iteration 82)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-030 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v597-pin-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 82 = Pin Engine**，来源：chatdev-design。

本迭代实现置顶引擎：添加、置顶、取消置顶、统计（4 种 kind：top/sticky/highlight/announcement）。

## 功能规格

### 1. 置顶引擎架构

```
PinAdder → Pinner → Unpinner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pne/PinEngine.ts` | 置顶引擎 |
| `src/pne/__tests__/PinEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PinKind = 'top' | 'sticky' | 'highlight' | 'announcement';

class PinEngine {
  add(name: string, kind: PinKind): string;
  pin(id: string): boolean;
  unpin(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { pins: number; totalAdded: number; totalPinned: number; totalUnpinned: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pne/__tests__/PinEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v597-pin-engine` 分支