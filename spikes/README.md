# Weblang Spikes

This directory tracks implementation spikes by version. Each spike is intentionally runnable and testable.

## Shared Workflow

From the version directories, you can run each spike with:

- `pnpm run compile` to build the spike sources
- `pnpm run validate` to check outputs against acceptance criteria
- `pnpm run test` to execute runtime behavior tests
- `pnpm run spike` to run the full compile-validate-test sequence

Or from the repository root, call each spike package directly with `--dir`:

- `pnpm --dir spikes/<version> run <command>`

## Spike v0

### Stage Goal

Ratify the default v0 authoring model for `.weblang` features.

### Scope

- Canonical features: Counter, Tabs, Users
- Compiler emits HTML, CSS, and ESM JS per feature
- Deterministic diagnostics output in JSON
- Validation checks aligned to Master Plan acceptance criteria
- Runtime behavior tests for all canonical features

### Progress Snapshot

- Status: PASS
- Requirements checked: 6
- Failed: 0
- Compile summary: files=3, features=3, emitted=3, errors=0, warnings=0

### Key Paths

- Sources: `spikes/v0/src/*.weblang`
- Compiler: `spikes/v0/compiler/index.mjs`
- Validation script: `spikes/v0/scripts/validate-spike.mjs`
- Runtime tests: `spikes/v0/tests/spike.runtime.test.mjs`
- Outputs: `spikes/v0/dist/*`
- Reports: `spikes/v0/reports/*`

## Spike v1

### Stage Goal

Add stronger CSS validation and deterministic compiler-diagnostic coverage while keeping v0 runtime behavior stable.

### Scope Delta vs v0

- Integrates Lightning CSS parsing in compiler CSS validation path
- Adds deterministic diagnostics test coverage for CSS parse failures
- Keeps canonical examples and runtime behavior checks

### Progress Snapshot

- Status: PASS
- Requirements checked: 6
- Failed: 0
- Compile summary: files=3, features=3, emitted=3, errors=0, warnings=0

### Key Paths

- Sources: `spikes/v1/src/*.weblang`
- Compiler: `spikes/v1/compiler/index.mjs`
- Validation script: `spikes/v1/scripts/validate-spike.mjs`
- Runtime tests: `spikes/v1/tests/spike.runtime.test.mjs`
- Diagnostics tests: `spikes/v1/tests/compiler.diagnostics.test.mjs`
- Outputs: `spikes/v1/dist/*`
- Reports: `spikes/v1/reports/*`

## Spike v2

### Stage Goal

Add stricter HTML attribute diagnostics while preserving v1 CSS validation and deterministic outputs.

### Scope Delta vs v1

- Adds HTML typed diagnostics for invalid `button[type]` values
- Adds deterministic compiler-diagnostics tests for HTML rule coverage
- Keeps existing canonical runtime behavior checks

### Progress Snapshot

- Status: PASS
- Requirements checked: 6
- Failed: 0
- Compile summary: files=3, features=3, emitted=3, errors=0, warnings=0

### Key Paths

- Sources: `spikes/v2/src/*.weblang`
- Compiler: `spikes/v2/compiler/index.mjs`
- Validation script: `spikes/v2/scripts/validate-spike.mjs`
- Runtime tests: `spikes/v2/tests/spike.runtime.test.mjs`
- CSS diagnostics tests: `spikes/v2/tests/compiler.diagnostics.test.mjs`
- HTML diagnostics tests: `spikes/v2/tests/compiler.html-diagnostics.test.mjs`
- Outputs: `spikes/v2/dist/*`
- Reports: `spikes/v2/reports/*`

## Spike v3

### Stage Goal

Decide and validate provider-backed diagnostics architecture instead of expanding custom standards validation logic.

### Scope Delta vs v2

- Adds diagnostics provider adapter interface in compiler flow
- Integrates html-validate as the active HTML provider alongside the existing CSS provider path
- Normalizes provider outputs to stable Weblang diagnostic codes
- Adds fixture and snapshot tests for deterministic normalized diagnostics

### Planned Work Checklist

- Define adapter contract and normalization schema mapping
- Add initial provider wiring to spike compiler
- Build invalid fixture corpus for HTML and CSS diagnostics
- Add deterministic snapshot tests for normalized diagnostics
- Produce provider recommendation summary with tradeoffs

### Progress Snapshot

- Status: PASS
- Requirements checked: 6
- Failed: 0
- Compile summary: files=3, features=3, emitted=3, errors=0, warnings=0

### Key Paths

- Design note: `docs/DIAGNOSTICS_PROVIDER_STRATEGY.md`
- Compiler: `spikes/v3/compiler/index.mjs`
- Validation script: `spikes/v3/scripts/validate-spike.mjs`
- Runtime tests: `spikes/v3/tests/spike.runtime.test.mjs`
- CSS diagnostics tests: `spikes/v3/tests/compiler.diagnostics.test.mjs`
- HTML diagnostics tests: `spikes/v3/tests/compiler.html-diagnostics.test.mjs`
- Provider adapter tests: `spikes/v3/tests/compiler.providers.test.mjs`
- Outputs: `spikes/v3/dist/*`
- Reports: `spikes/v3/reports/*`
