const ENV_VAR_NAMES = ['KH_API_KEY', 'KEEPERHUB_API_KEY', 'KEEPERSHUB_API_KEY'] as const;

export const SUPPORTED_ENV_VARS: ReadonlyArray<string> = ENV_VAR_NAMES;

export interface ApiKeySources {
  pluginConfig?: Record<string, unknown>;
  settings?: Array<unknown>;
  env?: Record<string, string | undefined>;
}

function firstString(...values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }
  return null;
}

export function resolveApiKey(sources: ApiKeySources): string | null {
  const fromConfig = firstString(sources.pluginConfig?.apiKey);
  if (fromConfig) return fromConfig;

  for (const setting of sources.settings ?? []) {
    const value = firstString(setting);
    if (value) return value;
  }

  for (const name of ENV_VAR_NAMES) {
    const value = firstString(sources.env?.[name]);
    if (value) return value;
  }

  return null;
}

export function isLikelyValidApiKey(apiKey: string): boolean {
  return apiKey.startsWith('kh_');
}

const WFB_KEY_NOT_FOR_MCP_MESSAGE =
  'Webhook keys (wfb_…) are for user webhook triggers only. Use an organization API key (kh_…) from Settings → API Keys → Organisation for MCP.';

export function getApiKeyKindWarning(apiKey: string): string | null {
  if (apiKey.startsWith('wfb_')) return WFB_KEY_NOT_FOR_MCP_MESSAGE;
  return null;
}

export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '***';
  return `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`;
}
