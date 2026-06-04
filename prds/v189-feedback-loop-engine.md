# PRD: PixelPal V189 — Feedback Loop Engine (Direction E Iteration 1/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-040 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v189-feedback-loop-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E = Feedback Loop Engine**，来源：thunderbolt Feedback Loops + nanobot Distributed Mesh。

本迭代 (1/9) 实现实时反馈调节 + 分布式节点健康检查。

## 功能规格

### 1. 反馈循环架构

```
感知 → 决策 → 执行 → 评估 → 调整 → 感知（循环）
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/feedback/FeedbackLoopEngine.ts` | 反馈循环引擎：感知、决策、调整 |
| `src/feedback/NodeHealthMonitor.ts` | nanobot风格分布式节点健康检查 |
| `src/feedback/__tests__/FeedbackLoopEngine.test.ts` | 反馈引擎测试 |
| `src/feedback/__tests__/NodeHealthMonitor.test.ts` | 健康检查测试 |

### 3. 接口设计

```typescript
interface FeedbackSignal {
  type: 'positive' | 'negative' | 'neutral';
  metric: string;
  value: number;
  timestamp: number;
  source: string;
}

interface FeedbackLoop {
  id: string;
  name: string;
  signals: FeedbackSignal[];
  state: 'expanding' | 'contracting' | 'stable';
  threshold: number;
  adjustmentRate: number;
}

interface NodeHealth {
  nodeId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: number;
  consecutiveFailures: number;
}

class FeedbackLoopEngine {
  // 记录反馈信号
  record(signal: Omit<FeedbackSignal, 'timestamp'>): void

  // 评估循环状态
  evaluate(loopId: string): FeedbackLoop

  // 自动调整阈值
  adjustThreshold(loopId: string, delta: number): void

  // 获取所有活跃循环
  getActiveLoops(): FeedbackLoop[]
}

class NodeHealthMonitor {
  // 检查节点健康
  async checkNode(nodeId: string): Promise<NodeHealth>

  // 批量检查所有节点
  async checkAll(): Promise<NodeHealth[]>

  // 标记节点为不健康
  markUnhealthy(nodeId: string): void

  // 获取健康节点列表
  getHealthyNodes(): string[]
}
```

### 4. thunderbolt Feedback Loops 映射

- Pipeline feedback → 循环状态评估
- Threshold → 阈值自动调节
- Adjustment rate → 调整速率

### 5. nanobot Distributed Mesh 映射

- 节点健康 → 分布式节点监控
- Heartbeat → 定期健康检查
- Degraded state → 降级运行

## 技术约束

- 零新增依赖
- 复用现有 `src/` 架构
- 不实际连接外部节点（模拟实现）

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/feedback/__tests__/`

## 验收标准

- [ ] `npx vitest run src/feedback --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v189-feedback-loop-engine` 分支