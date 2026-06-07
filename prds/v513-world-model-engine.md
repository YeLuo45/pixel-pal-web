# PRD: PixelPal V513 — Generic-Agent World Model Engine (Direction D Iteration 65)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-250 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v513-world-model-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 65 = World Model Engine**，来源：generic-agent-design。

本迭代实现世界模型引擎：对象添加、关系添加、查询、统计。

## 功能规格

### 1. 世界模型引擎架构

```
ObjectAdder → RelationAdder → WorldQuerier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wme/WorldModelEngine.ts` | 世界模型引擎 |
| `src/wme/__tests__/WorldModelEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class WorldModelEngine {
  addObject(name: string, type: string): string;
  addRelation(fromId: string, toId: string, type: string): string;
  query(id: string): { object: WorldObject; relations: WorldRelation[] };
  getStats(): { objects: number; relations: number; totalObjects: number; totalRelations: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wme/__tests__/WorldModelEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v513-world-model-engine` 分支