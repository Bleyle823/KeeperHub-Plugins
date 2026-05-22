# `keeperhub-hermes-plugin`

Hermes Agent Python plugin (**PyPI:** `keeperhub-hermes-plugin`) exposing **28 `kh_*` tools**
against the KeeperHub MCP endpoint (`https://app.keeperhub.com/mcp`), aligned with
[`@keeperhub/openclaw-plugin`](../../openclaw-plugins/keeperHub).

Uses [`keeperhub-mcp-client`](../../packages/keeperhub-mcp-client) for MCP transport.

## Requirements

- Python **3.9+** (uses postponed annotations; Hermes itself may require a newer Python — check your install).
- [Hermes Agent](https://hermes-agent.nousresearch.com/) with plugins enabled
- Dependencies: **keeperhub-mcp-client**, **httpx** (declared in `pyproject.toml`)

## Install

### Directory plugin (recommended for local dev)

Copy this folder to your Hermes plugins directory:

```bash
cp -r hermes-plugins/keeperHub ~/.hermes/plugins/keeperHub
```

Then enable it:

```bash
hermes plugins enable keeperHub
```

Plugins are opt-in; discovery lists them under `/plugins` until enabled.

### Pip / entry point

From `hermes-plugins/keeperHub/`:

```bash
pip install -e ".[dev]"
```

Entry point: `hermes_agent.plugins` → `keeperHub = keeperhub_plugin.entry:register`.

## Configuration

`plugin.yaml` declares **`KH_API_KEY`** via `requires_env`. Hermes prompts during `hermes plugins install` and stores values in `.env`.

The plugin also reads (in order): **`KH_API_KEY`**, **`KEEPERHUB_API_KEY`** — same as OpenClaw/Eliza.

## Tool responses

Handlers return JSON strings: `{"ok": true, "text": "..."}` or `{"ok": false, "error": "..."}`.

## Tests

```bash
cd hermes-plugins/keeperHub
pip install -e ".[dev]"
pytest
```

## Tools

Matches OpenClaw `openclaw.plugin.json` `contracts.tools`: workflows, executions, templates, plugins/schemas, integrations, protocol actions, direct execution, marketplace (+ org fallback), AI generation, docs, `kh_status`.
