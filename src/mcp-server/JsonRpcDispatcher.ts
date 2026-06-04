/**
 * MCP Server — JSON-RPC 2.0 Dispatcher (PixelPal V185)
 *
 * Implements the JSON-RPC 2.0 spec (https://www.jsonrpc.org/specification) so
 * PixelPal can act as an MCP Server and route incoming tool calls to its
 * Emotion / Memory / Skill / Evolution engines.
 *
 * Features:
 *  - request/response correlation by id
 *  - notifications (no id → no response emitted)
 *  - batch requests (array of requests, may be mixed with notifications)
 *  - empty batch → InvalidRequest
 *  - standard error codes: -32700 ParseError, -32600 InvalidRequest,
 *    -32601 MethodNotFound, -32602 InvalidParams, -32603 InternalError
 *  - register / unregister / hasMethod / listMethods
 *  - handler may be sync or async; JsonRpcError is forwarded with its code
 */

export type JsonRpcId = string | number | null;
export type JsonRpcParams = unknown[] | Record<string, unknown> | undefined;

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: JsonRpcParams;
  id?: JsonRpcId;
}

export interface JsonRpcSuccessResponse {
  jsonrpc: '2.0';
  result: unknown;
  id: JsonRpcId;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcErrorResponse {
  jsonrpc: '2.0';
  error: JsonRpcErrorObject;
  id: JsonRpcId | null;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;
export type JsonRpcHandler = (params: JsonRpcParams) => unknown | Promise<unknown>;

export const JsonRpcErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const;

export class JsonRpcError extends Error {
  readonly code: number;
  readonly data: unknown;
  constructor(code: number, message: string, data?: unknown) {
    super(message);
    this.name = 'JsonRpcError';
    this.code = code;
    this.data = data;
  }
}

export class JsonRpcDispatcher {
  private readonly methods: Map<string, JsonRpcHandler> = new Map();

  /** Register a method handler. Replaces any previous handler with the same name. */
  register(method: string, handler: JsonRpcHandler): void {
    this.methods.set(method, handler);
  }

  /** Unregister a method. Returns true if the method existed. */
  unregister(method: string): boolean {
    return this.methods.delete(method);
  }

  /** Returns true if the method has a registered handler. */
  hasMethod(method: string): boolean {
    return this.methods.has(method);
  }

  /** Returns the sorted list of registered method names. */
  listMethods(): string[] {
    return Array.from(this.methods.keys()).sort();
  }

  /**
   * Dispatch a raw JSON-RPC 2.0 message (single object or array).
   * Returns a JSON string — empty string means "all requests were notifications".
   */
  async dispatch(input: string): Promise<string> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch (err) {
      return JSON.stringify(
        this.formatErrorResponse(
          null,
          JsonRpcErrorCodes.ParseError,
          'Parse error',
          String(err),
        ),
      );
    }

    if (Array.isArray(parsed)) {
      return this.dispatchBatch(parsed);
    }

    const response = await this.handleSingle(parsed);
    return response === null ? '' : JSON.stringify(response);
  }

  private async dispatchBatch(batch: unknown[]): Promise<string> {
    if (batch.length === 0) {
      return JSON.stringify(
        this.formatErrorResponse(null, JsonRpcErrorCodes.InvalidRequest, 'Invalid Request'),
      );
    }
    const responses: JsonRpcResponse[] = [];
    for (const req of batch) {
      const resp = await this.handleSingle(req);
      if (resp !== null) {
        responses.push(resp);
      }
    }
    if (responses.length === 0) {
      return '';
    }
    return JSON.stringify(responses);
  }

  private async handleSingle(raw: unknown): Promise<JsonRpcResponse | null> {
    if (!isPlainObject(raw)) {
      return this.formatErrorResponse(null, JsonRpcErrorCodes.InvalidRequest, 'Invalid Request');
    }

    const id = (raw as { id?: JsonRpcId }).id;
    const responseId: JsonRpcId | null = id === undefined ? null : id;

    if (!isValidRequest(raw)) {
      return this.formatErrorResponse(responseId, JsonRpcErrorCodes.InvalidRequest, 'Invalid Request');
    }

    const req = raw as JsonRpcRequest;

    // Notification: no id → call handler but emit no response (errors swallowed).
    if (req.id === undefined) {
      try {
        await this.invokeMethod(req.method, req.params);
      } catch {
        // Per spec, errors from notifications MUST NOT be sent to the client.
      }
      return null;
    }

    const handler = this.methods.get(req.method);
    if (!handler) {
      return this.formatErrorResponse(
        req.id,
        JsonRpcErrorCodes.MethodNotFound,
        'Method not found',
        req.method,
      );
    }

    try {
      const result = await handler(req.params);
      return this.formatSuccessResponse(req.id, result);
    } catch (err) {
      if (err instanceof JsonRpcError) {
        return this.formatErrorResponse(req.id, err.code, err.message, err.data);
      }
      const message = err instanceof Error ? err.message : String(err);
      return this.formatErrorResponse(req.id, JsonRpcErrorCodes.InternalError, 'Internal error', message);
    }
  }

  private async invokeMethod(method: string, params: JsonRpcParams): Promise<unknown> {
    const handler = this.methods.get(method);
    if (!handler) {
      throw new JsonRpcError(JsonRpcErrorCodes.MethodNotFound, 'Method not found', method);
    }
    return await handler(params);
  }

  private formatSuccessResponse(id: JsonRpcId, result: unknown): JsonRpcSuccessResponse {
    return { jsonrpc: '2.0', result, id };
  }

  private formatErrorResponse(
    id: JsonRpcId | null,
    code: number,
    message: string,
    data?: unknown,
  ): JsonRpcErrorResponse {
    const error: JsonRpcErrorObject = { code, message };
    if (data !== undefined) {
      error.data = data;
    }
    return { jsonrpc: '2.0', error, id };
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidRequest(value: Record<string, unknown>): boolean {
  if (value['jsonrpc'] !== '2.0') {
    return false;
  }
  const method = value['method'];
  if (typeof method !== 'string' || method.length === 0) {
    return false;
  }
  return true;
}
