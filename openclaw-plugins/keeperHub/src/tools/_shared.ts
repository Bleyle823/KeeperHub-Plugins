/**
 * Shared helpers for KeeperHub OpenClaw tool registrations.
 */

import {
  getClient,
  type KeeperHubMcpClient,
} from '@keeperhub/mcp-client';

import { getApiKeyKindWarning, resolveApiKey } from '../config.js';

/** @deprecated Use KeeperHubMcpClient */
export type KeeperHubClient = KeeperHubMcpClient;

export interface PluginApiLike {
  pluginConfig?: Record<string, unknown>;
  logger?: {
    debug?(...args: unknown[]): void;
    info?(...args: unknown[]): void;
    warn?(...args: unknown[]): void;
    error?(...args: unknown[]): void;
  };
}

export interface ToolTextBlock {
  type: 'text';
  text: string;
}

export interface ToolResult {
  content: ToolTextBlock[];
  isError?: boolean;
}

export function toToolText(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}

export function toToolError(err: unknown, prefix = 'KeeperHub error'): ToolResult {
  const raw = err instanceof Error ? err.message : String(err ?? 'unknown error');
  const text = raw.startsWith('KeeperHub') ? raw : `${prefix}: ${raw}`;
  return { content: [{ type: 'text', text }], isError: true };
}

export function resolveClient(
  api: PluginApiLike,
): { client: KeeperHubMcpClient; error: null } | { client: null; error: ToolResult } {
  const apiKey = resolveApiKey(api);
  if (!apiKey) {
    return {
      client: null,
      error: toToolError(
        'KH_API_KEY is not configured. Set plugins.entries.keeperHub.config.apiKey or the KH_API_KEY environment variable.',
      ),
    };
  }
  const keyWarning = getApiKeyKindWarning(apiKey);
  if (keyWarning) {
    return { client: null, error: toToolError(keyWarning) };
  }
  const client = getClient(apiKey, {
    logger: api.logger ?? console,
    clientInfo: { name: '@keeperhub/openclaw-plugin', version: '1.0.0' },
  });
  return { client, error: null };
}

export interface RunMcpOptions {
  client?: KeeperHubMcpClient | null;
}

export async function runMcp(
  api: PluginApiLike,
  toolName: string,
  args: Record<string, unknown>,
  format: (result: unknown) => string,
  opts: RunMcpOptions = {},
): Promise<ToolResult> {
  let client: KeeperHubMcpClient | null;
  if (opts.client !== undefined) {
    client = opts.client;
    if (!client) return toToolError('KH_API_KEY is not configured.');
  } else {
    const resolved = resolveClient(api);
    if (resolved.error) return resolved.error;
    client = resolved.client;
  }

  try {
    const result = await client.callTool(toolName, args);
    return toToolText(format(result));
  } catch (err) {
    api.logger?.error?.(`[KeeperHub] ${toolName} failed:`, err);
    return toToolError(err);
  }
}

export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export function fencedJson(value: unknown): string {
  return '```json\n' + JSON.stringify(value, null, 2) + '\n```';
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}
