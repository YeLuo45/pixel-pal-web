# PRD: PixelPal V427 — Nanobot Worker Manager (Direction B Iteration 48)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-475 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v427-worker-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 48 = Worker Manager**，来源：nanobot-design。

本迭代实现工作者管理器：工作者注册、任务分配、worker统计。

## 功能规格

### 1. 工作者管理器架构

```
WorkerRegistrar → TaskAssigner → WorkerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wkm/WorkerManager.ts` | 工作者管理器 |
| `src/wkm/__tests__/WorkerManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Worker {
  id: string;
  name: string;
  task: string;
  busy: boolean;
  tasks: number;
}

class WorkerManager {
  register(name: string, task: string): string;
  assign(id: string): boolean;
  release(id: string): boolean;
  getStats(): { workers: number; busy: number; idle: number; totalTasks: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wkm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wkm/__tests__/WorkerManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v427-worker-manager` 分支