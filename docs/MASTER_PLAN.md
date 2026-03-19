# Weblang Master Plan

Date: 2026-03-18
Status: Draft v0.1

## 1. Decision Snapshot

Weblang is the working language name.

The target file extension is `.weblang`.

Locality of behavior remains important, but it is now one of several top-level goals rather than the single defining goal.

Weblang is intended to be practical to implement on top of existing web tooling while remaining implementation-agnostic.

## 2. Product Thesis

Weblang is a web-native composition language that keeps HTML, CSS, and JS or TS as first-class syntax in one feature-oriented unit, while compiling to standard web platform files.

The language should reduce coordination complexity between structure, style, behavior, assets, and tests without replacing platform primitives.

## 3. Top Priority Goals

1. Locality and clarity of behavior.
2. Type safety across HTML, CSS, and JS or TS.
3. Testing as a first-class capability.
4. Accessible-by-default authoring and output.
5. AI-first authoring and maintenance ergonomics.
6. Assets as a core language concern.
7. Standard web output with minimal magic.

## 4. Non-Goals

- No virtual DOM requirement.
- No proprietary rendering engine.
- No custom CSS runtime model by default.
- No mandatory global state model.
- No lock-in to one framework runtime.

## 5. Core Language Shape (Current Direction)

Main unit: `feature`.

Primary blocks:

- `html`
- `css`
- `ts` or `js`

Runtime bindings:

- `root`
- `props`
- `cleanup`
- `emit`

Lifecycle direction:

1. Instantiate.
2. Render or adopt DOM.
3. Attach scoped styles.
4. Run behavior.
5. Mount.
6. Unmount and run cleanups.

DOM ownership modes:

- create mode
- adopt mode

## 6. Type Safety Strategy

### 6.1 HTML Type Safety

Goals:

- Typed attributes and properties for known elements.
- Typed event payloads where feasible.
- Safer template interpolation defaults.

Potential implementation path:

- Parse `html` into AST.
- Validate against typed DOM schemas.
- Generate typed bindings and diagnostics.
- Explore integration with typed-html style tooling for static checks.

### 6.2 CSS Type Safety

Goals:

- Catch invalid properties and values earlier.
- Validate token and custom property usage.
- Provide typed contracts for style exports where relevant.

Potential implementation path:

- Use lightningcss parsing and transforms for validation and output.
- Add optional type contracts for design tokens and custom properties.
- Add selector and scope diagnostics tied to feature structure.

### 6.3 JS or TS Type Safety

Goals:

- Keep behavior in standard TS or JS.
- Use TS for full authoring-time safety and declaration output where needed.

Potential implementation path:

- Use TypeScript as the primary checker and emitter for `ts` blocks.
- Generate source maps that preserve block-level traceability.

## 7. Testing as a First-Class Citizen

Weblang should treat testing as built-in workflow, not a post-hoc integration.

Goals:

- Native authoring patterns that are test-friendly by default.
- First-class integration with Playwright, Cypress, and Selenium.
- Stable selectors and deterministic feature lifecycles for UI tests.

Potential implementation path:

- Compiler emits optional test manifest containing feature names, stable mount points, and lifecycle hooks.
- Define guidance for test selectors that survive refactors.
- Provide generated test harness helpers for mount or adopt flows.

## 8. Accessible-by-Default Direction

Weblang should make strong semantics and accessibility the default outcome, not an optional afterthought.

Goals:

- Start from semantic HTML as the baseline output contract.
- Preserve keyboard-operable interaction patterns for interactive UI.
- Encourage correct ARIA usage only when semantic elements alone are insufficient.
- Surface accessibility issues in editor diagnostics and compile or build output.

Potential implementation path:

- Add static accessibility diagnostics for common semantic and ARIA mistakes.
- Integrate optional accessibility checks into compile and build pipelines.
- Emit structured diagnostics with fix hints for common a11y issues.
- Define a v0 accessibility baseline profile for examples and generated output.

## 9. AI-First Language Direction

Weblang should be deliberately optimized for collaboration with LLMs.

### 9.1 Relevant LLM Strengths

- Pattern synthesis from examples and conventions.
- Fast draft generation for repetitive structures.
- Strong transformation support (refactor, migrate, normalize).
- Good retrieval-conditioned writing when rules are explicit.

### 9.2 Relevant LLM Constraints

- Hallucination under ambiguous specs.
- Fragility when syntax is overly implicit.
- Error-prone edits when diagnostics are vague.

### 9.3 AI-First Design Implications

Weblang should provide:

- A small, regular grammar with few exceptions.
- Deterministic, machine-readable diagnostics.
- Structured compiler error codes with fix hints.
- Stable, parseable file layout conventions.
- Predictable generated output and source mapping.
- Explicit escape hatches for unsafe operations.

### 9.4 AI-Native Tooling Targets

- AST-aware transforms for safe large edits.
- Canonical formatter behavior.
- Lint rules aligned to language goals.
- Optional explainability output: "why this compiled output was produced."

## 10. Assets as a Core Language Concern

Assets must be modeled as first-class, not incidental.

Scope includes:

- images
- video
- audio
- fonts
- icons
- sitemap and related metadata outputs

Goals:

- Typed and validated asset references.
- Predictable URL and hashing behavior.
- Progressive loading and performance defaults.
- Build-time diagnostics for missing, oversized, or incompatible assets.

Potential implementation path:

- Integrate with Vite asset pipeline and plugin ecosystem.
- Emit asset manifest with source-to-output mapping.
- Support responsive image generation hooks through existing tools.

## 11. Compilation Contract

All compiled output must be standard web platform artifacts.

Minimum output set:

- ESM JavaScript modules
- CSS files
- HTML-compatible output or templates
- source maps

Optional output set:

- declarations for typed integration
- test manifest
- asset manifest

No hidden proprietary runtime format should be required to execute output in modern browsers.

## 12. Leverage Existing Technologies

Prefer existing tools for heavy lifting where possible.

Primary candidates:

- TypeScript for type checking and JS emission.
- lightningcss for CSS parsing, transforms, and validation support.
- Vite ecosystem for bundling, dev server, HMR, and plugin composition.
- typed-html style approaches for HTML typing exploration.

Evaluation criteria:

- standards alignment
- maturity and maintenance risk
- performance
- integration complexity
- ability to preserve inspectable output

## 13. Implementation and Ecosystem Relationship

Working model:

- Weblang is a standalone language effort.
- Implementations should target standard browser artifacts and interoperate with existing web tooling.

Recommended rollout:

1. Build an experimental standalone Weblang toolchain.
2. Validate with real examples, tests, and migrations.
3. Stabilize spec sections proven in production.

## 14. Security and CSP Posture

Defaults:

- escaped interpolation for text
- constrained attribute interpolation
- no implicit raw HTML insertion
- no eval-based compilation model

Security requirements:

- explicit unsafe APIs where unavoidable
- clear Trusted Types and CSP compatibility guidance
- auditable compiled output

## 15. Proposed Milestones

### Milestone A: Foundation

- Finalize naming and baseline grammar for `.weblang`.
- Define v0 semantics for feature lifecycle and scoping.
- Produce compiler spike with typed diagnostics prototype.

### Milestone B: Type and Test Integration

- Add HTML and CSS type-checking passes.
- Add test manifest and baseline Playwright integration.
- Add accessibility diagnostics and baseline semantic or keyboard checks.
- Validate stability on canonical examples.

### Milestone C: AI and Asset Maturity

- Add machine-readable diagnostics and fix-hint schema, including a11y codes.
- Add first-class asset model and manifest outputs.
- Validate AI-assisted edit workflows end to end.

## 16. Open Questions

1. Should interpolation in `html` be allowed in v0 or deferred behind a feature flag?
2. What is the minimal CSS type system that provides real value without false certainty?
3. Should the test manifest be compiler-native or plugin-provided initially?
4. Should asset declarations be explicit block syntax or inferred from imports first?
5. Which subset of AI-oriented diagnostics should be mandatory in v0?
6. Which accessibility checks should be compiler-native in v0 versus plugin-provided?

## 17. Immediate Next Steps

1. Ratify this plan as the current working direction.
2. Draft a v0 grammar and diagnostics contract in a follow-up spec doc.
3. Define a thin standalone implementation spike using Vite and lightningcss.
4. Select 3 canonical `.weblang` examples (counter, tabs, users) plus one asset-heavy example.
5. Define a v0 accessibility baseline with semantic, keyboard, and ARIA diagnostic criteria.
