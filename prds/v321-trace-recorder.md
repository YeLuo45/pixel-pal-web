# PRD: PixelPal V321 — Claude Code Trace Recorder (Direction A Iteration 27)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-081 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v321-trace-recorder |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 27 = Trace Recorder**，来源：claude-code-design。

本迭代实现调用追踪器：追踪记录、追踪链路、追踪查询、追踪过滤。

## 功能规格

### 1. 调用追踪器架构

```
TraceWriter → TraceLinker → TraceQuerier → TraceFilter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/trace/TraceRecorder.ts` | 调用追踪器 |
| `src/trace/__tests__/TraceRecorder.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Trace {
  id: string;
  span: string;
  parent: string | null;
  start: number;
  end: number;
  duration: number;
  status: 'ok' | 'error';
}

class TraceRecorder {
  start(span: string, parent: string | null): string;
  end(id: string, status: 'ok' | 'error'): number;
  getTrace(id: string): Trace | null;
  getStats(): { traces: number; avgDuration: number; errors: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/trace/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/trace/__tests__/TraceRecorder.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v321-trace-recorder` 分支