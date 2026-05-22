import { Service, type IAgentRuntime, logger } from '@elizaos/core';
import {
  KeeperHubMcpClient,
  resolveApiKey,
  type KeeperHubOrgContext,
} from '@keeperhub/mcp-client';

const PLUGIN_CLIENT_NAME = '@keeperhub/eliza-plugin';
const PLUGIN_CLIENT_VERSION = '1.0.0';

function getKeeperHubApiKey(runtime: IAgentRuntime): string | null {
  return resolveApiKey({
    settings: [
      runtime.getSetting('KH_API_KEY'),
      runtime.getSetting('KEEPERHUB_API_KEY'),
    ],
    env: process.env,
  });
}

export type { KeeperHubOrgContext };

export class KeeperHubService extends Service {
  static override serviceType = 'keeperhub';

  override capabilityDescription =
    'Connects to KeeperHub MCP server to manage blockchain automation workflows, monitor smart contracts, and execute DeFi actions.';

  private client: KeeperHubMcpClient | null = null;
  orgContext: KeeperHubOrgContext = { orgId: null, workflowCount: 0 };

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static override async start(runtime: IAgentRuntime): Promise<Service> {
    logger.info('[KeeperHub] Starting KeeperHubService');
    const service = new KeeperHubService(runtime);
    const apiKey = getKeeperHubApiKey(runtime);

    if (!apiKey) {
      logger.warn(
        '[KeeperHub] KH_API_KEY or KEEPERHUB_API_KEY not set — KeeperHub actions will fail until configured',
      );
    } else {
      try {
        service.client = new KeeperHubMcpClient({
          apiKey,
          clientInfo: { name: PLUGIN_CLIENT_NAME, version: PLUGIN_CLIENT_VERSION },
        });
        await service.client.refreshOrgContext();
        service.orgContext = service.client.orgContext;
      } catch (err) {
        service.client = null;
        logger.warn(
          `[KeeperHub] ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    return service;
  }

  static override async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info('[KeeperHub] Stopping KeeperHubService');
    const service = runtime.getService(KeeperHubService.serviceType);
    if (service && 'stop' in service && typeof service.stop === 'function') {
      await service.stop();
    }
  }

  override async stop(): Promise<void> {
    this.client?.resetSession();
    this.client = null;
    logger.info('[KeeperHub] KeeperHubService stopped');
  }

  isReady(): boolean {
    return this.client !== null;
  }

  async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.client) {
      throw new Error('KH_API_KEY is not configured');
    }
    const result = await this.client.callTool(name, args);
    this.orgContext = this.client.orgContext;
    return result;
  }
}
