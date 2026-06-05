# PRD: PixelPal V261 — Claude Code Logger (Direction A Iteration 15)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-097 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v261-logger |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 15 = Logger**，来源：claude-code-design。

本迭代实现日志记录器：日志级别、日志格式化、日志过滤、日志导出。

## 功能规格

### 1. 日志记录器架构

```
LogLevel → Formatter → Filter → Exporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/logger/Logger.ts` | 日志记录器 |
| `src/logger/__tests__/Logger.test.ts` | 测试 |

### 3. 接口设计

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

class Logger {
  log(entry: Omit<LogEntry, 'timestamp'>): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  filter(level: LogLevel): LogEntry[];
  export(format: 'json' | 'text'): string;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/logger/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/logger/__tests__/Logger.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v261-logger` 分支