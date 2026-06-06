# PRD: PixelPal V415 — Thunderbolt Replay Manager (Direction E Iteration 45)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-424 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v415-replay-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 45 = Replay Manager**，来源：thunderbolt-design。

本迭代实现重放管理器：记录保存、记录回放、回放统计。

## 功能规格

### 1. 重放管理器架构

```
RecordSaver → ReplayPlayer → ReplayReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rm/ReplayManager.ts` | 重放管理器 |
| `src/rm/__tests__/ReplayManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Replay {
  id: string;
  name: string;
  steps: number;
  position: number;
  active: boolean;
}

class ReplayManager {
  save(name: string, steps: number): string;
  play(id: string): boolean;
  pause(id: string): boolean;
  getStats(): { replays: number; playing: number; paused: number; totalSteps: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rm/__tests__/ReplayManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v415-replay-manager` 分支