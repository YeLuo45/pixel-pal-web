# PRD: PixelPal V521 — Nanobot Probe Engine (Direction B Iteration 67)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-272 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v521-probe-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 67 = Probe Engine**，来源：nanobot-design。

本迭代实现探针引擎：探针添加、探测、日志、统计（3 种状态：ok/warn/fail）。

## 功能规格

### 1. 探针引擎架构

```
ProbeAdder → ProbeExecutor → ProbeLogger
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pre2/ProbeEngine.ts` | 探针引擎 |
| `src/pre2/__tests__/ProbeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ProbeStatus = 'ok' | 'warn' | 'fail';

class ProbeEngine {
  add(target: string): string;
  probe(id: string, latency: number, status: ProbeStatus): boolean;
  log(id: string): boolean;
  getStats(): { probes: number; totalAdded: number; totalProbed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pre2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pre2/__tests__/ProbeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v521-probe-engine` 分支