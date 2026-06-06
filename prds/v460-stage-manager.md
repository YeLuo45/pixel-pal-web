# PRD: PixelPal V460 — Thunderbolt Stage Manager (Direction E Iteration 54)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-029 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v460-stage-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 54 = Stage Manager**，来源：thunderbolt-design。

本迭代实现阶段管理器：阶段创建、进入、退出、完成、失败、统计。

## 功能规格

### 1. 阶段管理器架构

```
StageCreator → StageEnter → StageExit → StageComplete
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sm/StageManager.ts` | 阶段管理器 |
| `src/sm/__tests__/StageManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
type StageStatus = 'pending' | 'active' | 'completed' | 'failed';

interface Stage {
  id: string;
  name: string;
  order: number;
  status: StageStatus;
}

class StageManager {
  create(name: string, order: number): string;
  enter(id: string): boolean;
  exit(id: string): boolean;
  complete(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { stages: number; totalCompleted: number; totalFailed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sm/__tests__/StageManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v460-stage-manager` 分支