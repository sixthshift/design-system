# Using Claude Code in this DevContainer

Claude Code runs inside the container, following the personal devcontainer standard (see the `devcontainer` skill in dotfiles — the source of truth for versions and conventions).

## Setup

1. **Ensure Docker is running**, and that `ssh-agent` has your key on the host (`ssh-add --apple-use-keychain`, or `AddKeysToAgent yes` in `~/.ssh/config`) — git auth inside the container comes from agent forwarding, not mounted keys.
2. **Open in VS Code** → `Dev Containers: Reopen in Container` (first build takes a few minutes).
3. **Authenticate Claude** once, inside the container:

```bash
claude auth login
```

Config persists in the `claude-config` volume across rebuilds. Volumes are namespaced per project, so each project logs in separately.

## Using Claude Code

```bash
claude       # interactive
clauded      # claude --dangerously-skip-permissions (alias)
```

## Isolation model — what's actually true

`clauded` is acceptable here because of what this container can and cannot reach:

- ✅ **No host filesystem** beyond this project's workspace.
- ✅ **No SSH keys in the container** — agent forwarding only; keys can be used for git, never read.
- ✅ **No docker socket** — the host Docker daemon is unreachable.
- ⚠️ **Full network egress.** A prompt-injected agent could exfiltrate anything readable inside the container: this project's source and whatever is in `.devcontainer/.env`. Accepted risk — keep only low-value dev credentials in `.env`. If this project ever holds credentials whose theft would hurt, add the egress firewall (see the skill's optional blocks).
- ⚠️ Claude runs as **root inside the container** — full access within it, by design.

## Project specifics

- **Storybook** on port 6006 (`bun run storybook`) — forwarded to the host. Main dev surface for the component library.
- **Tests** run under vitest with a browser-mode project (`@vitest/browser-playwright`). Playwright's chromium is **not** baked into the image — run `bunx playwright install --with-deps chromium` inside the container if you need the browser suite. Unit tests (`bun run test`) work without it.
- No database or Docker sidecars — this is a pure library/monorepo build.

## Volumes and persistence

- `claude-config` → `/root/.claude` — auth/settings, survives rebuilds
- `design-system-node-modules` → `/workspace/node_modules` — container-private so Linux and macOS native binaries don't collide

## Departures from standard

- **Playwright chromium not installed** in the image (detected but skipped to keep the image small). Install on demand; documented above. This is the only departure.

## Troubleshooting

Rebuild from the Command Palette: `Dev Containers: Rebuild Container`.
