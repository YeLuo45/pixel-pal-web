# PRD: PixelPal V596 — Nanobot Triage Engine (Direction B Iteration 82)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-027 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v596-triage-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 82 = Triage Engine**，来源：nanobot-design。

本迭代实现分诊引擎：添加、分诊、统计（5 种 level：critical/high/medium/low/deferred）。

## 功能规格

### 1. 分诊引擎架构

```
ItemAdder → Triager → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tge/TriageEngine.ts` | 分诊引擎 |
| `src/tge/__tests__/TriageEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TriageLevel = 'critical' | 'high' | 'medium' | 'low' | 'deferred';

class TriageEngine {
  add(subject: string, level?: TriageLevel): string;
  triage(id: string, level: TriageLevel, assignee: string): boolean;
  remove(id: string): boolean;
  getStats(): { items: number; totalAdded: number; totalTriaged: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tge/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tge/__tests__/TriageEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v596-triage-engine` 分支