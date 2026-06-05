# PRD: PixelPal V320 — Thunderbolt Event Logger (Direction E Iteration 26)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-079 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v320-event-logger |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 26 = Event Logger**，来源：thunderbolt-design。

本迭代实现事件日志器：日志记录、日志查询、日志级别、日志过滤。

## 功能规格

### 1. 事件日志器架构

```
LogWriter → LogQuerier → LevelFilter → LogFilter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/log/EventLogger.ts` | 事件日志器 |
| `src/log/__tests__/EventLogger.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
  timestamp: number;
}

class EventLogger {
  log(level: string, message: string, source: string): string;
  filter(level: string): LogEntry[];
  getStats(): { entries: number; errors: number; warnings: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/log/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/log/__tests__/EventLogger.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v320-event-logger` 分支