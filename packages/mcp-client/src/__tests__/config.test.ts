import { describe, expect, it } from 'bun:test';

import {
  getApiKeyKindWarning,
  isLikelyValidApiKey,
  maskApiKey,
  resolveApiKey,
} from '../config.js';

describe('resolveApiKey', () => {
  it('prefers pluginConfig.apiKey over env', () => {
    expect(
      resolveApiKey({
        pluginConfig: { apiKey: 'kh_from_config' },
        env: { KH_API_KEY: 'kh_from_env' },
      }),
    ).toBe('kh_from_config');
  });

  it('reads settings then env', () => {
    expect(
      resolveApiKey({
        settings: [null, '  kh_setting  '],
        env: { KEEPERHUB_API_KEY: 'kh_env' },
      }),
    ).toBe('kh_setting');
  });
});

describe('getApiKeyKindWarning', () => {
  it('rejects wfb_ keys for MCP', () => {
    expect(getApiKeyKindWarning('wfb_test')).toContain('webhook');
  });

  it('allows kh_ keys', () => {
    expect(getApiKeyKindWarning('kh_test')).toBeNull();
  });
});

describe('maskApiKey', () => {
  it('masks long keys', () => {
    expect(maskApiKey('kh_abcdefghijklmnop')).toMatch(/^kh_a/);
  });
});

describe('isLikelyValidApiKey', () => {
  it('expects kh_ prefix', () => {
    expect(isLikelyValidApiKey('kh_abc')).toBe(true);
    expect(isLikelyValidApiKey('wfb_abc')).toBe(false);
  });
});
