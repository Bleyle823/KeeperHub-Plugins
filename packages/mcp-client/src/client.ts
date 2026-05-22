const MCP_URL = 'https://app.keeperhub.com/mcp';
const MCP_PROTOCOL_VERSION = '2024-11-05';
const DEFAULT_CLIENT_NAME = '@keeperhub/mcp-client';
const DEFAULT_CLIENT_VERSION = '1.0.0';

export interface KeeperHubOrgContext {
  orgId: string | null;
  workflowCount: number;
}

export interface CallToolResult {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export interface ClientLogger {
  debug?(...args: unknown[]): void;
  info?(...args: unknown[]): void;
  warn?(...args: unknown[]): void;
  error?(...args: unknown[]): void;
}

export interface ClientInfo {
  name: string;
  version: string;
}

export interface KeeperHubMcpClientOptions {
  apiKey: string;
  logger?: ClientLogger;
  clientInfo?: ClientInfo;
}

export class KeeperHubMcpClient {
  readonly apiKey: string;
  private readonly logger: ClientLogger;
  private readonly clientInfo: ClientInfo;
  private sessionId: string | null = null;
  private requestId = 0;
  orgContext: KeeperHubOrgContext = { orgId: null, workflowCount: 0 };

  constructor(options: KeeperHubMcpClientOptions) {
    const apiKey = options.apiKey?.trim();
    if (!apiKey) {
      throw new Error('KeeperHubMcpClient requires a non-empty apiKey');
    }
    this.apiKey = apiKey;
    this.logger = options.logger ?? console;
    this.clientInfo = options.clientInfo ?? {
      name: DEFAULT_CLIENT_NAME,
      version: DEFAULT_CLIENT_VERSION,
    };
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    await this.ensureSession();
    const result = (await this.postMcp({
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'tools/call',
      params: { name, arguments: args },
    })) as CallToolResult | undefined;

    if (result?.isError) {
      const msg = result.content?.[0]?.text ?? 'Unknown KeeperHub error';
      throw new Error(`KeeperHub tool error (${name}): ${msg}`);
    }

    const text = result?.content?.[0]?.text;
    if (typeof text === 'string') {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    return result;
  }

  async refreshOrgContext(): Promise<KeeperHubOrgContext> {
    try {
      const workflows = (await this.callTool('list_workflows', {})) as unknown;
      const list = Array.isArray(workflows) ? (workflows as Array<Record<string, unknown>>) : [];
      const orgId =
        list.length > 0 ? ((list[0]?.organizationId as string | undefined) ?? null) : null;
      this.orgContext = { orgId, workflowCount: list.length };
    } catch {
      // Non-fatal; context stays whatever it was.
    }
    return this.orgContext;
  }

  resetSession(): void {
    this.sessionId = null;
  }

  private async ensureSession(): Promise<void> {
    if (this.sessionId) return;

    const body = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'initialize',
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: this.clientInfo,
      },
    };

    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`KeeperHub initialize failed (${res.status}): ${text}`);
    }

    const sid = res.headers.get('mcp-session-id');
    if (!sid) throw new Error('KeeperHub did not return mcp-session-id');
    this.sessionId = sid;
    this.logger.info?.('[KeeperHub] MCP session established');
  }

  private async postMcp(body: object): Promise<unknown> {
    if (!this.sessionId) throw new Error('No active MCP session');

    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: { ...this.headers(), 'mcp-session-id': this.sessionId },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      this.logger.warn?.('[KeeperHub] Session unauthorized, re-initializing');
      this.sessionId = null;
      await this.ensureSession();
      return this.postMcp(body);
    }

    if (res.status === 404) {
      const text = await res.text().catch(() => '');
      if (text.toLowerCase().includes('session')) {
        this.logger.warn?.('[KeeperHub] Session expired, re-initializing');
        this.sessionId = null;
        await this.ensureSession();
        return this.postMcp(body);
      }
      throw new Error(`KeeperHub MCP error (404): ${text}`);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`KeeperHub MCP error (${res.status}): ${text}`);
    }

    const json = (await res.json()) as { result?: unknown; error?: { message: string } };
    if (json.error) throw new Error(`KeeperHub RPC error: ${json.error.message}`);
    return json.result;
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }
}

/** @deprecated Use KeeperHubMcpClient */
export type KeeperHubClient = KeeperHubMcpClient;

export interface GetClientOptions {
  logger?: ClientLogger;
  clientInfo?: ClientInfo;
}

let cachedClient: KeeperHubMcpClient | null = null;
let cachedKey: string | null = null;

export function getClient(apiKey: string, options: GetClientOptions = {}): KeeperHubMcpClient {
  const trimmed = apiKey.trim();
  if (!cachedClient || cachedKey !== trimmed) {
    cachedClient = new KeeperHubMcpClient({
      apiKey: trimmed,
      logger: options.logger,
      clientInfo: options.clientInfo,
    });
    cachedKey = trimmed;
  }
  return cachedClient;
}

export function __resetClientForTests(): void {
  cachedClient = null;
  cachedKey = null;
}
