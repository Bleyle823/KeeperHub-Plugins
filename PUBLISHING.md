# Publishing guide

Official KeeperHub agent packages under the **`@keeperhub`** npm scope and
**`keeperhub-*`** PyPI names. Publish in this order so dependents resolve cleanly.

## Package map

| Package | Registry | Path |
| --- | --- | --- |
| `@keeperhub/mcp` | npm | [KeeperHub/mcp](https://github.com/KeeperHub/mcp) (`packages/mcp`) |
| `keeperhub-mcp` | PyPI | [`packages/keeperhub-mcp`](packages/keeperhub-mcp) |
| `@keeperhub/eliza-plugin` | npm | [`plugin-keeperHub`](plugin-keeperHub) |
| `@keeperhub/openclaw-plugin` | npm + [ClawHub](https://docs.openclaw.ai/tools/clawhub) | [`openclaw-plugins/keeperHub`](openclaw-plugins/keeperHub) |
| `keeperhub-hermes-plugin` | PyPI | [`hermes-plugins/keeperHub`](hermes-plugins/keeperHub) |

## Prerequisites

- npm org access: **`@keeperhub`**
- PyPI project access: **`keeperhub-mcp`**, **`keeperhub-hermes-plugin`**
- ClawHub publisher account for OpenClaw (scoped name e.g. `@keeperhub/openclaw-plugin`)
- `LICENSE` and `NOTICE` at repo root (included)

## 1. Publish MCP clients (required first)

### TypeScript — `@keeperhub/mcp`

Published from [KeeperHub/mcp](https://github.com/KeeperHub/mcp). Release via PR + `npm-v*` tag (Trusted Publishing). Plugins depend on **`@keeperhub/mcp@^0.1.1`** from npm.

### Python — `keeperhub-mcp`

```bash
cd packages/keeperhub-mcp
pip install build twine
python -m build
twine upload dist/*
```

Before publishing plugins, change local `file:` / `workspace:*` deps on
`@keeperhub/mcp` to **`^0.1.1`** (and `keeperhub-mcp>=0.1.1` in
`pyproject.toml`).

## 2. Publish `@keeperhub/eliza-plugin`

From [`plugin-keeperHub`](plugin-keeperHub) (or the same tree vendored as
`packages/plugin-keeperHub` inside a full ElizaOS monorepo):

```bash
cd plugin-keeperHub
# Ensure @keeperhub/mcp is published and listed as ^0.1.1 in package.json
# (@elizaos/core stays a peerDependency — not bundled)
bun install
bun run build
bun test
npm publish --access public
```

**Community registry (v1):** open a PR to
[elizaos/registry](https://github.com/elizaos/registry) with package metadata for
`@keeperhub/eliza-plugin`. **`@elizaos/*` npm** requires Eliza core invite — out of
scope for v1.

## 3. Publish `@keeperhub/openclaw-plugin`

```bash
cd openclaw-plugins/keeperHub
bun install   # from repo root: bun install (workspace)
bun run build
bun test
npm publish --access public
```

**ClawHub:**

```bash
openclaw plugins install @keeperhub/openclaw-plugin
# or: clawhub:@keeperhub/openclaw-plugin
```

Follow [OpenClaw ClawHub docs](https://docs.openclaw.ai/tools/clawhub) for
authenticated publish/sync.

## 4. Publish `keeperhub-hermes-plugin`

```bash
cd hermes-plugins/keeperHub
# pyproject.toml: keeperhub-mcp>=0.1.1 (not file:)
pip install build twine
python -m build
twine upload dist/*
```

Users install with:

```bash
pip install keeperhub-hermes-plugin
```

Hermes discovers the plugin via the `hermes_agent.plugins` entry point (`keeperHub`).

## Local development (monorepo)

From repository root:

```bash
bun install
bun test
cd packages/keeperhub-mcp && pip install -e ".[dev]" && pytest
cd ../../hermes-plugins/keeperHub && pip install -e ".[dev]" && pytest
```

Workspaces in root [`package.json`](package.json): `openclaw-plugins/keeperHub`,
`plugin-keeperHub`. MCP transport is **`@keeperhub/mcp`** from npm (not vendored here).

## Deprecated package names

| Old name | Replacement |
| --- | --- |
| `@elizaos/plugin-keeperhub` | `@keeperhub/eliza-plugin` |
| `openclaw-keepershub` | `@keeperhub/openclaw-plugin` |
| `@keepershub/openclaw-keepershub` (ClawHub) | `@keeperhub/openclaw-plugin` |
| `hermes-plugin-keepershub` | `keeperhub-hermes-plugin` |

OpenClaw config plugin id remains **`keeperHub`** (`plugins.entries.keeperHub`).

## Versioning

- **1.0.0** — initial scoped releases after MCP client extraction
- Bump **`@keeperhub/mcp`** first when transport behavior changes; then bump plugins
