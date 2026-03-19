# Weblang

Weblang is a web-native language exploration for composing HTML, CSS, and JS/TS in feature-oriented units that compile to standard web outputs.

## Repository Map

- docs: planning and design documents
- spikes: runnable implementation spikes by version
- packages/vscode: VS Code language support extension

## Run Spikes

From the repository root:

- pnpm --dir spikes/v0 install
- pnpm --dir spikes/v0 run spike
- pnpm --dir spikes/v1 install
- pnpm --dir spikes/v1 run spike
- pnpm --dir spikes/v2 install
- pnpm --dir spikes/v2 run spike
- pnpm --dir spikes/v3 install
- pnpm --dir spikes/v3 run spike

Run individual stages for any spike version:

- pnpm --dir spikes/<version> run compile
- pnpm --dir spikes/<version> run validate
- pnpm --dir spikes/<version> run test

## Where To Read Next

- spikes/README.md for current spike progress and commands
- docs/MASTER_PLAN.md for language direction and milestones
- docs/SPEC_V0_GRAMMAR.md for current grammar and runtime semantics

## Notes

- Package management is pnpm.
- Spike packages are self-contained under spikes/v0, spikes/v1, spikes/v2, and spikes/v3.
