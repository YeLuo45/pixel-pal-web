# PRD: PixelPal V412 — Nanobot Container Manager (Direction B Iteration 45)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-392 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v412-container-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 45 = Container Manager**，来源：nanobot-design。

本迭代实现容器管理器：容器创建、容器使用、容器统计。

## 功能规格

### 1. 容器管理器架构

```
ContainerCreator → ContainerUser → ContainerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cntm/ContainerManager.ts` | 容器管理器 |
| `src/cntm/__tests__/ContainerManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Container {
  id: string;
  name: string;
  image: string;
  running: boolean;
}

class ContainerManager {
  create(name: string, image: string): string;
  start(id: string): boolean;
  stop(id: string): boolean;
  getStats(): { containers: number; running: number; stopped: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cntm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cntm/__tests__/ContainerManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v412-container-manager` 分支