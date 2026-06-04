# PRD: PixelPal V190 — MCP Client + JSON-RPC 2.0 Full Duplex (Direction A Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-041 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v190-mcp-client-full-duplex |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 2/9 = MCP Client + Full Duplex JSON-RPC 2.0**，延续 V185 的 MCP Server Core，实现客户端双向通信。

本迭代在 V185 基础上添加：
- MCP Client 实现（支持发起请求、接收响应）
- JSON-RPC 2.0 Batch 调用
- 双向通知（Notification）机制
- 错误处理规范化

## 功能规格

### 1. MCP Client 接口

```typescript
interface MCPClientConfig {
  endpoint: string;  // WebSocket URL
  reconnectInterval?: number;
  maxRetries?: number;
}

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: unknown;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

class MCPClient {
  connect(): Promise<void>
  disconnect(): void
  sendRequest(method: string, params?: unknown): Promise<unknown>
  sendNotification(method: string, params?: unknown): void
  sendBatch(requests: JSONRPCRequest[]): Promise<JSONRPCResponse[]>
  onResponse(handler: (response: JSONRPCResponse) => void): void
  onError(handler: (error: Error) => void): void
}
```

### 2. 复用 V185 MCP Server

- `src/mcp-server/JSONRPCDispatcher.ts` — 已有
- `src/mcp-server/MCPServer.ts` — 已有
- 新增 Client 与 Server 通过 MessageBus 通信

### 3. 错误码规范

```typescript
enum JSONRPCError {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000,
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mcp-server/__tests__/MCPClient.test.ts`

## 验收标准

- [ ] `npx vitest run src/mcp-server --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v190-mcp-client-full-duplex` 分支