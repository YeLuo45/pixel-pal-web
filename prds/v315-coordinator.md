# PRD: PixelPal V315 — Thunderbolt Coordinator (Direction E Iteration 25)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-069 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v315-coordinator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 25 = Coordinator**，来源：thunderbolt-design。

本迭代实现协调器：任务协调、状态同步、异常处理、报告生成。

## 功能规格

### 1. 协调器架构

```
TaskCoordinator → StateSynchronizer → ExceptionHandler → ReportGenerator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/coord/Coordinator.ts` | 协调器 |
| `src/coord/__tests__/Coordinator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Task {
  id: string;
  name: string;
  state: 'pending' | 'running' | 'done' | 'failed';
}

class Coordinator {
  addTask(name: string): string;
  start(id: string): boolean;
  complete(id: string): boolean;
  fail(id: string, reason: string): boolean;
  getStats(): { tasks: number; done: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/coord/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/coord/__tests__/Coordinator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v315-coordinator` 分支