"""Smoke test: Hermes plugin uses keeperhub-mcp."""

import pytest

from keeperhub_mcp import KeeperHubMcpClient, classify_api_key


def test_classify_org_key():
    assert classify_api_key("kh_test") == "org"


def test_empty_key_raises():
    with pytest.raises(ValueError, match="non-empty"):
        KeeperHubMcpClient("")
