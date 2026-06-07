# PRD: PixelPal V578 — Generic-Agent Desire Engine (Direction D Iteration 78)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-313 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v578-desire-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 78 = Desire Engine**，来源：generic-agent-design。

本迭代实现欲望引擎：添加、满足、不满足、统计（4 种优先级：low/normal/high/urgent）。

## 功能规格

### 1. 欲望引擎架构

```
DesireAdder → Satisfier → Unsatisfier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/dre/DesireEngine.ts` | 欲望引擎 |
| `src/dre/__tests__/DesireEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type DesirePriority = 'low' | 'normal' | 'high' | 'urgent';

class DesireEngine {
  add(name: string, priority: DesirePriority, intensity: number): string;
  satisfy(id: string): boolean;
  unsatisfy(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { desires: number; totalAdded: number; totalSatisfied: number; totalUnsatisfied: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/dre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/dre/__tests__/DesireEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v578-desire-engine` 分支