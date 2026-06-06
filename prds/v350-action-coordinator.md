# PRD: PixelPal V350 — Thunderbolt Action Coordinator (Direction E Iteration 32)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-181 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v350-action-coordinator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 32 = Action Coordinator**，来源：thunderbolt-design。

本迭代实现动作协调器：动作注册、动作调度、动作协调、动作报告。

## 功能规格

### 1. 动作协调器架构

```
ActionRegistrar → ActionScheduler → ActionCoordinator → ActionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ac/ActionCoordinator.ts` | 动作协调器 |
| `src/ac/__tests__/ActionCoordinator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface CoordinatedAction {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  coordinatedWith: string[];
}

class ActionCoordinator {
  register(name: string): string;
  coordinate(id1: string, id2: string): boolean;
  getStats(): { actions: number; coordinated: number; totalRelations: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ac/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ac/__tests__/ActionCoordinator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v350-action-coordinator` 分支