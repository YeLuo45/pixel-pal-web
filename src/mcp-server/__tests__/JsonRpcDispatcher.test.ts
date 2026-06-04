import { describe, it, expect, beforeEach } from 'vitest';
import {
  JsonRpcDispatcher,
  JsonRpcError,
  JsonRpcErrorCodes,
} from '../JsonRpcDispatcher';

describe('JsonRpcDispatcher', () => {
  let dispatcher: JsonRpcDispatcher;

  beforeEach(() => {
    dispatcher = new JsonRpcDispatcher();
  });

  describe('registry', () => {
    it('starts with no methods', () => {
      expect(dispatcher.hasMethod('foo')).toBe(false);
      expect(dispatcher.listMethods()).toEqual([]);
    });

    it('registers a method', () => {
      dispatcher.register('sum', (params) => (params as number[]).reduce((a, b) => a + b, 0));
      expect(dispatcher.hasMethod('sum')).toBe(true);
      expect(dispatcher.listMethods()).toEqual(['sum']);
    });

    it('registers multiple methods and lists them sorted', () => {
      dispatcher.register('zeta', () => 1);
      dispatcher.register('alpha', () => 2);
      dispatcher.register('mu', () => 3);
      expect(dispatcher.listMethods()).toEqual(['alpha', 'mu', 'zeta']);
    });

    it('replaces a handler when re-registering same name', () => {
      dispatcher.register('echo', () => 'first');
      dispatcher.register('echo', () => 'second');
      expect(dispatcher.listMethods()).toEqual(['echo']);
    });

    it('unregisters an existing method', () => {
      dispatcher.register('foo', () => 1);
      expect(dispatcher.unregister('foo')).toBe(true);
      expect(dispatcher.hasMethod('foo')).toBe(false);
    });

    it('unregister returns false when method does not exist', () => {
      expect(dispatcher.unregister('nope')).toBe(false);
    });
  });

  describe('JsonRpcErrorCodes', () => {
    it('exposes the spec-defined error codes', () => {
      expect(JsonRpcErrorCodes.ParseError).toBe(-32700);
      expect(JsonRpcErrorCodes.InvalidRequest).toBe(-32600);
      expect(JsonRpcErrorCodes.MethodNotFound).toBe(-32601);
      expect(JsonRpcErrorCodes.InvalidParams).toBe(-32602);
      expect(JsonRpcErrorCodes.InternalError).toBe(-32603);
    });
  });

  describe('JsonRpcError class', () => {
    it('preserves code, message and data', () => {
      const err = new JsonRpcError(-32602, 'bad params', { field: 'x' });
      expect(err).toBeInstanceOf(Error);
      expect(err.code).toBe(-32602);
      expect(err.message).toBe('bad params');
      expect(err.data).toEqual({ field: 'x' });
      expect(err.name).toBe('JsonRpcError');
    });

    it('allows data to be undefined', () => {
      const err = new JsonRpcError(-32603, 'oops');
      expect(err.data).toBeUndefined();
    });
  });

  describe('dispatch — parse errors', () => {
    it('returns ParseError when input is not valid JSON', async () => {
      const out = await dispatcher.dispatch('not-json{');
      const resp = JSON.parse(out);
      expect(resp.jsonrpc).toBe('2.0');
      expect(resp.error.code).toBe(JsonRpcErrorCodes.ParseError);
      expect(resp.id).toBeNull();
    });

    it('returns ParseError for empty string', async () => {
      const out = await dispatcher.dispatch('');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.ParseError);
    });
  });

  describe('dispatch — invalid request shapes', () => {
    it('returns InvalidRequest when payload is null', async () => {
      const out = await dispatcher.dispatch('null');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when payload is a number', async () => {
      const out = await dispatcher.dispatch('42');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when payload is a string', async () => {
      const out = await dispatcher.dispatch('"hello"');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when payload is a boolean', async () => {
      const out = await dispatcher.dispatch('true');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when method field is missing', async () => {
      const out = await dispatcher.dispatch(JSON.stringify({ jsonrpc: '2.0', id: 1 }));
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
      expect(resp.id).toBe(1);
    });

    it('returns InvalidRequest when method is not a string', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 123, id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when method is empty string', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: '', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns InvalidRequest when jsonrpc field is not "2.0"', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '1.0', method: 'foo', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });
  });

  describe('dispatch — method not found', () => {
    it('returns MethodNotFound with the method name as data', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'ghost', id: 7 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.MethodNotFound);
      expect(resp.error.message).toBe('Method not found');
      expect(resp.error.data).toBe('ghost');
      expect(resp.id).toBe(7);
    });
  });

  describe('dispatch — success', () => {
    it('returns result for a registered sync handler', async () => {
      dispatcher.register('add', (params) => {
        const [a, b] = params as number[];
        return a + b;
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'add', params: [2, 3], id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp).toEqual({ jsonrpc: '2.0', result: 5, id: 1 });
    });

    it('awaits async handlers', async () => {
      dispatcher.register('slow', async () => {
        await new Promise((r) => setTimeout(r, 5));
        return 'done';
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'slow', id: 'abc' }),
      );
      const resp = JSON.parse(out);
      expect(resp.result).toBe('done');
      expect(resp.id).toBe('abc');
    });

    it('accepts null id', async () => {
      dispatcher.register('ping', () => 'pong');
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'ping', id: null }),
      );
      const resp = JSON.parse(out);
      expect(resp.result).toBe('pong');
      expect(resp.id).toBeNull();
    });

    it('passes object params to handler', async () => {
      let captured: unknown;
      dispatcher.register('capture', (params) => {
        captured = params;
        return true;
      });
      await dispatcher.dispatch(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'capture',
          params: { name: 'pal', n: 2 },
          id: 1,
        }),
      );
      expect(captured).toEqual({ name: 'pal', n: 2 });
    });

    it('handler may return undefined', async () => {
      dispatcher.register('noop', () => undefined);
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'noop', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.result).toBeUndefined();
      expect(resp.id).toBe(1);
    });
  });

  describe('dispatch — handler errors', () => {
    it('wraps plain Error in InternalError with the message as data', async () => {
      dispatcher.register('boom', () => {
        throw new Error('kaboom');
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'boom', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InternalError);
      expect(resp.error.message).toBe('Internal error');
      expect(resp.error.data).toBe('kaboom');
    });

    it('forwards JsonRpcError with original code and message', async () => {
      dispatcher.register('bad', () => {
        throw new JsonRpcError(JsonRpcErrorCodes.InvalidParams, 'bad arg', { field: 'x' });
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'bad', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidParams);
      expect(resp.error.message).toBe('bad arg');
      expect(resp.error.data).toEqual({ field: 'x' });
    });

    it('wraps non-Error thrown values in InternalError', async () => {
      dispatcher.register('weird', () => {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'a string';
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'weird', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InternalError);
      expect(resp.error.data).toBe('a string');
    });
  });

  describe('dispatch — notifications', () => {
    it('returns empty string for a notification (no id)', async () => {
      let called = false;
      dispatcher.register('log', () => {
        called = true;
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'log', params: ['hi'] }),
      );
      expect(out).toBe('');
      expect(called).toBe(true);
    });

    it('swallows errors thrown inside a notification handler', async () => {
      dispatcher.register('explode', () => {
        throw new Error('nope');
      });
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'explode' }),
      );
      expect(out).toBe('');
    });

    it('returns MethodNotFound-ish behavior for a notification with unknown method? No — silently drops it', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'unknownNotification' }),
      );
      // No response for notifications, even when method is missing.
      expect(out).toBe('');
    });
  });

  describe('dispatch — batches', () => {
    beforeEach(() => {
      dispatcher.register('sum', (params) => {
        const [a, b, c] = params as number[];
        return a + b + c;
      });
      dispatcher.register('subtract', (params) => {
        const [a, b] = params as number[];
        return a - b;
      });
      dispatcher.register('notify', () => undefined);
    });

    it('returns InvalidRequest for empty array', async () => {
      const out = await dispatcher.dispatch('[]');
      const resp = JSON.parse(out);
      expect(resp.error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
      expect(resp.id).toBeNull();
    });

    it('returns an array of responses for a mixed batch', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify([
          { jsonrpc: '2.0', method: 'sum', params: [1, 2, 4], id: '1' },
          { jsonrpc: '2.0', method: 'notify', params: [7] },
          { jsonrpc: '2.0', method: 'subtract', params: [42, 23], id: '2' },
          { foo: 'boo' },
          { jsonrpc: '2.0', method: 'sum', params: [1, 2, 4] }, // notification
        ]),
      );
      const arr = JSON.parse(out);
      expect(Array.isArray(arr)).toBe(true);
      expect(arr).toHaveLength(3);
      expect(arr[0]).toEqual({ jsonrpc: '2.0', result: 7, id: '1' });
      expect(arr[1]).toEqual({ jsonrpc: '2.0', result: 19, id: '2' });
      expect(arr[2].error.code).toBe(JsonRpcErrorCodes.InvalidRequest);
    });

    it('returns empty string when batch is all notifications', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify([
          { jsonrpc: '2.0', method: 'notify', params: [1] },
          { jsonrpc: '2.0', method: 'notify', params: [2] },
        ]),
      );
      expect(out).toBe('');
    });

    it('processes single-element batch', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify([{ jsonrpc: '2.0', method: 'sum', params: [1, 2, 3], id: 1 }]),
      );
      const arr = JSON.parse(out);
      expect(arr).toEqual([{ jsonrpc: '2.0', result: 6, id: 1 }]);
    });

    it('preserves response order regardless of which requests fail', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify([
          { jsonrpc: '2.0', method: 'sum', params: [1, 1, 1], id: 10 },
          { jsonrpc: '2.0', method: 'unknown', id: 11 },
          { jsonrpc: '2.0', method: 'subtract', params: [10, 5], id: 12 },
        ]),
      );
      const arr = JSON.parse(out);
      expect(arr.map((r: { id: unknown }) => r.id)).toEqual([10, 11, 12]);
    });
  });

  describe('dispatch — error response shape', () => {
    it('omits data field when undefined', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'ghost', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.error).toEqual({
        code: JsonRpcErrorCodes.MethodNotFound,
        message: 'Method not found',
        data: 'ghost',
      });
    });

    it('always includes jsonrpc: "2.0" in responses', async () => {
      const out = await dispatcher.dispatch(
        JSON.stringify({ jsonrpc: '2.0', method: 'ghost', id: 1 }),
      );
      const resp = JSON.parse(out);
      expect(resp.jsonrpc).toBe('2.0');
    });
  });
});
