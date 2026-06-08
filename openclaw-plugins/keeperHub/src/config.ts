/**
 * OpenClaw-specific config resolution — delegates key lookup to @keeperhub/mcp.
 */

import {
  getApiKeyKindWarning,
  isLikelyValidApiKey,
  resolveApiKey as resolveApiKeyCore,
  SUPPORTED_ENV_VARS,
  type ApiKeySources,
} from '@keeperhub/mcp';

export interface ApiConfigSurface {
  pluginConfig?: Record<string, unknown>;
}

export function resolveApiKey(api: ApiConfigSurface): string | null {
  return resolveApiKeyCore({
    pluginConfig: api.pluginConfig,
    env: process.env,
  } satisfies ApiKeySources);
}

export { getApiKeyKindWarning, isLikelyValidApiKey, SUPPORTED_ENV_VARS };
