# Publishing guide

Official KeeperHub agent packages under the **`@keeperhub`** npm scope and
**`keeperhub-*`** PyPI names. Publish in this order so dependents resolve cleanly.

## Package map

| Package | Registry | Path |
| --- | --- | --- |
| `@keeperhub/mcp-client` | npm | [`packages/mcp-client`](packages/mcp-client) |
| `keeperhub-mcp-client` | PyPI | [`packages/keeperhub-mcp-client`](packages/keeperhub-mcp-client) |
| `@keeperhub/eliza-plugin` | npm | [`plugin-keeperHub`](plugin-keeperHub) |
| `@keeperhub/openclaw-plugin` | npm + [ClawHub](https://docs.openclaw.ai/tools/clawhub) | [`openclaw-plugins/keeperHub`](openclaw-plugins/keeperHub) |
| `keeperhub-hermes-plugin` | PyPI | [`hermes-plugins/keeperHub`](hermes-plugins/keeperHub) |

## Prerequisites

- npm org access: **`@keeperhub`**
- PyPI project access: **`keeperhub-mcp-client`**, **`keeperhub-hermes-plugin`**
- ClawHub publisher account for OpenClaw (scoped name e.g. `@keeperhub/openclaw-plugin`)
- `LICENSE` and `NOTICE` at repo root (included)

## 1. Publish MCP clients (required first)

### TypeScript — `@keeperhub/mcp-client`

```bash
cd packages/mcp-client
bun install
bun run build
bun test
npm publish --access public
```

### Python — `keeperhub-mcp-client`

```bash
cd packages/keeperhub-mcp-client
pip install build twine
python -m build
twine upload dist/*
```

Before publishing plugins, change local `file:` / `workspace:*` deps on
`@keeperhub/mcp-client` to **`^1.0.0`** (and `keeperhub-mcp-client>=1.0.0` in
`pyproject.toml`).

## 2. Publish `@keeperhub/eliza-plugin`

From [`plugin-keeperHub`](plugin-keeperHub) (or the same tree vendored as
`packages/plugin-keeperHub` inside a full ElizaOS monorepo):

```bash
cd plugin-keeperHub
# Ensure @keeperhub/mcp-client is published and listed as ^1.0.0 in package.json
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
# pyproject.toml: keeperhub-mcp-client>=1.0.0 (not file:)
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
bun run build:mcp-client
bun test
cd packages/keeperhub-mcp-client && pip install -e ".[dev]" && pytest
cd ../../hermes-plugins/keeperHub && pip install -e ".[dev]" && pytest
```

Workspaces in root [`package.json`](package.json): `packages/mcp-client`,
`openclaw-plugins/keeperHub`, `plugin-keeperHub`.

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
- Bump **mcp-client** first when transport behavior changes; then bump plugins
