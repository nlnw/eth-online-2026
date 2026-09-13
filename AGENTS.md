# AGENTS.md

## Background Processes & Daemon Execution
- **Default Tmux Instance:** When running long-running processes, dev servers, background listeners, or daemons, execute them through the default tmux instance (usually session `0`).
- **One Window Per Command / Service:**
  - Dedicate one window per distinct command/service. Do NOT bundle or run multiple separate services under a single concurrent multiplexer process in one window.
  - For example, run the backend server in a `server` window and the frontend client in a separate `client` window.
- **Append Windows at the End (Do NOT Force Index 0):**
  - Always append new windows at the end of the session after the highest existing window index.
  - Never overwrite, prepend, or force index `0` or any existing window index.
  - To append a window at the end:
    ```bash
    # Determine the highest window index in session 0 and append after it
    LAST_WIN=$(tmux list-windows -t 0 -F "#{window_index}" | sort -n | tail -n 1)
    tmux new-window -a -t 0:${LAST_WIN} -n "<service_name>" -c "<working_directory>"
    tmux send-keys -t 0:<service_name> "<command>" C-m
    ```
  - View pane / window output:
    ```bash
    tmux capture-pane -pt 0:<service_name> -S -50
    ```
  - Switch window: `tmux select-window -t 0:<service_name>`

## Tooling & Runtime Environment
- **Package Managers:** Never install system packages via `apt` or system-level package managers.
- **Mise Management:** Node, npm, pnpm, python, and other developer tools are managed globally via **mise** (`~/.local/share/mise/shims`). Install locally or globally via `mise` if additional tooling is required.
- Ensure `export PATH="$HOME/.local/share/mise/shims:$PATH"` is loaded when invoking non-interactive subshells or scripts.

## Git Configuration & Safety
- **Git Identity:** Do NOT touch, set, or modify `git config` (such as `user.name` or `user.email`). Use existing pre-configured git identities in the environment.
