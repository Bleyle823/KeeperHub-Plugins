"""Resolve KeeperHub API key — delegates to keeperhub-mcp-client."""

from __future__ import annotations

from keeperhub_mcp_client.keys import (
    ENV_VAR_NAMES,
    ORG_KEY_HINT,
    SUPPORTED_ENV_VARS,
    WFB_KEY_NOT_FOR_MCP_MESSAGE,
    get_api_key_kind_warning,
    is_likely_valid_api_key,
    is_org_api_key,
    resolve_api_key,
    validate_api_key_for_mcp,
)

__all__ = [
    "ENV_VAR_NAMES",
    "ORG_KEY_HINT",
    "SUPPORTED_ENV_VARS",
    "WFB_KEY_NOT_FOR_MCP_MESSAGE",
    "get_api_key_kind_warning",
    "is_likely_valid_api_key",
    "is_org_api_key",
    "resolve_api_key",
    "validate_api_key_for_mcp",
]
