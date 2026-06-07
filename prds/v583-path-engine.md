# PRD: PixelPal V583 — Generic-Agent Path Engine (Direction D Iteration 79)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-325 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v583-path-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 79 = Path Engine**，来源：generic-agent-design。

本迭代实现路径引擎：添加、步进、完成、阻塞、统计（4 种状态：open/in-progress/completed/blocked）。

## 功能规格

### 1. 路径引擎架构

```
StepAdder → Stepper → Completer → Blocker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pte/PathEngine.ts` | 路径引擎 |
| `src/pte/__tests__/PathEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PathStatus = 'open' | 'in-progress' | 'completed' | 'blocked';

class PathEngine {
  add(name: string, index: number): string;
  step(id: string): boolean;
  complete(id: string): boolean;
  block(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { steps: number; totalAdded: number; totalStepped: number; totalCompleted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pte/__tests__/PathEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v583-path-engine` 分支