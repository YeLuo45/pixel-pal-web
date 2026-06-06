# PRD: PixelPal V346 — Claude Code Log Manager (Direction A Iteration 32)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-161 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v346-log-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 32 = Log Manager**，来源：claude-code-design。

本迭代实现日志管理器：日志写入、日志查询、日志清理、日志报告。

## 功能规格

### 1. 日志管理器架构

```
LogWriter → LogQuerier → LogCleaner → LogReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/log2/LogManager.ts` | 日志管理器 |
| `src/log2/__tests__/LogManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: number;
}

class LogManager {
  log(level: LogLevel, message: string, source: string): string;
  query(filter: { level?: LogLevel; source?: string }): LogEntry[];
  clear(): number;
  getStats(): { entries: number; byLevel: Record<LogLevel, number> };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/log2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/log2/__tests__/LogManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v346-log-manager` 分支