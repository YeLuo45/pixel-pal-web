# PRD: PixelPal V176 - Dream Memory L0-L4 Architecture (Direction A)

## 概述

基于 nanobot Dream Memory + generic-agent L0-L4 Memory 架构，为 PixelPal 构建五层记忆系统，实现记忆的自动分层、遗忘与结晶。

## 背景与现状

- **已有**: DreamMemoryStore（hot/warm/cold 三层，SQLite 持久化）
- **缺失**: L0-L4 五层语义记忆、记忆结晶（Skill Crystallization）、长期记忆检索
- **目标**: 参照 generic-agent L0-L4 分层模型扩展现有架构

## 架构设计

### L0-L4 记忆层次（对应 nanobot Dream Memory）

| 层级 | 名称 | 来源 | 说明 |
|------|------|------|------|
| L0 | META | generic-agent L0 | 记忆元信息、统计、访问模式 |
| L1 | INSIGHT_INDEX | generic-agent L1 | 索引标签、主题聚类 |
| L2 | WORKING | nanobot Dream | 当前会话热记忆（≈ hot 层） |
| L3 | EPISODIC | nanobot Dream | 情节记忆片段（≈ warm 层） |
| L4 | SEMANTIC | generic-agent L4 | 长期知识、摘要结晶（≈ cold 层） |

### 现有 DreamMemoryStore 映射

```
DreamMemoryStore (hot/warm/cold)
  → hot   = L2 (WORKING)
  → warm  = L3 (EPISODIC)  
  → cold  = L4 (SEMANTIC)
  + L0 (META) = 访问统计元数据
  + L1 (INSIGHT_INDEX) = 标签/聚类索引
```

## 功能清单

### 1. AIMemory class（src/memory/AIMemory.ts）
- L0-L4 五层接口抽象
- 层间记忆迁移规则（promote/demote）
- 记忆重要性评分（importance_score）
- 记忆结晶检测（当 L4 记忆被反复访问时标记为 crystallized）

### 2. DreamManager 增强（src/memory/DreamManager.ts）
- 继承现有 DreamMemoryStore
- 添加 `crystallize()` 方法：将高频 L4 记忆升级为技能碎片
- 添加 `recall(fromLayer, query)` 方法：跨层语义检索

### 3. MemorySummarizer 增强
- 新增 `summarizeForL4()`: 将 L3 情节记忆压缩为 L4 语义知识
- 阈值控制：L3 访问次数 ≥ 10 次时触发压缩

### 4. 测试用例（src/memory/__tests__/AIMemory.test.ts）
- 覆盖率目标：99%+
- 测试 L0-L4 各层 CRUD
- 测试层间迁移逻辑
- 测试结晶检测

## 技术约束

- **零新增依赖**：使用 Web Crypto API 做 hash，不引入新库
- **SQLite 兼容性**：继续使用 wa-sqlite
- **向后兼容**：DreamMemoryStore 现有 API 不变

## 验收标准

1. `AIMemory` 类实现完整 L0-L4 接口
2. `DreamManager.crystallize()` 可正确识别高频 L4 记忆
3. 层间迁移符合配置阈值
4. 测试通过率 100%，覆盖率 ≥ 99%
5. `pnpm run build` 成功（exit code 0）