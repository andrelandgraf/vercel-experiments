import { $ } from "bun";

// Define the commands
const buildCmd = "bun --hot run ./scripts/build.tsx";
const serveCmd = "cd public && bun index.html";
const sessionName = "marketing-dev";

// Helper to kill tmux session if it exists
await $`tmux kill-session -t ${sessionName} || true`;

// Start a new tmux session with two panels
await $`tmux new-session -d -s ${sessionName} '${buildCmd}'`;
await $`tmux split-window -h -t ${sessionName} '${serveCmd}'`;
await $`tmux select-layout -t ${sessionName} even-horizontal`;
await $`tmux attach-session -t ${sessionName}`;
