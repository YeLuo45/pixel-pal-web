# PRD: PixelPal V399 — Generic-Agent Insight Engine (Direction D Iteration 42)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-337 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v399-insight-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 42 = Insight Engine**，来源：generic-agent-design。

本迭代实现洞察引擎：洞察生成、洞察验证、洞察统计。

## 功能规格

### 1. 洞察引擎架构

```
InsightGenerator → InsightVerifier → InsightReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ie/InsightEngine.ts` | 洞察引擎 |
| `src/ie/__tests__/InsightEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Insight {
  id: string;
  topic: string;
  content: string;
  confidence: number;
  verified: boolean;
}

class InsightEngine {
  generate(topic: string, content: string, confidence: number): string;
  verify(id: string, verified: boolean): boolean;
  getStats(): { insights: number; verified: number; unverified: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ie/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ie/__tests__/InsightEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v399-insight-engine` 分支