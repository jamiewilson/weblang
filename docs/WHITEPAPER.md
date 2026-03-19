# Weblang Whitepaper v1

Date: 2026-03-18
Status: Draft
Audience: Conceptual and practical, with technical callouts

## Executive Summary

Weblang is currently framed as a web-native programming and composition language. That framing is directionally strong, but not yet specific enough to guarantee the right implementation strategy. The central question is not only language design. The deeper question is what minimum abstraction layer can simultaneously deliver:

- Locality and clarity of behavior.
- Type safety across HTML, CSS, and JS or TS.
- Testing as a first-class capability.
- Accessible-by-default output.
- AI-first authoring ergonomics.
- First-class asset handling.
- Standard web platform output with minimal magic.

This whitepaper evaluates whether these outcomes require a new language, or whether they can be achieved by other paradigms such as a constrained authoring profile, a compiler with conventions, or a manifest/protocol plus tooling stack.

Working conclusion in v1:

1. The goals are achievable through multiple paradigms.
2. A full new language is not automatically required in v0.
3. A practical path is a strict Weblang authoring profile with a formal spec and compiler contract, while leaving room to evolve toward a fuller language only if evidence demands it.

## 1. Problem Statement

Web development suffers from fragmentation of concerns across structure, style, behavior, assets, testing, and accessibility responsibilities. Existing ecosystems usually optimize one or two dimensions and defer others.

Typical failure modes:

- Behavior spread across files and abstraction layers, reducing locality.
- Safety checks uneven across HTML, CSS, and JS.
- Testing added after architecture decisions, not before.
- Accessibility treated as linting or post-hoc QA.
- Asset strategy handled by bundler defaults rather than language semantics.
- Tooling optimized for humans or frameworks, not for robust AI collaboration.

Weblang seeks a coherent authoring model that keeps platform primitives first-class while creating explicit contracts for safety, testability, and accessibility.

## 2. Is "New Programming Language" the Right Frame?

### 2.1 Candidate Framings

1. New programming language.
2. Constrained composition language/profile over HTML/CSS/TS.
3. Compiler plus conventions spec.
4. Protocol and manifest ecosystem with thin syntax.

### 2.2 Evaluation Criteria

- Goal coverage: can it satisfy all Weblang goals?
- Complexity cost: parser, tooling, migration, docs, support load.
- Adoption friction: can existing teams onboard incrementally?
- Inspectability: can output remain standard and transparent?
- AI reliability: can diagnostics and structure be machine-friendly?

### 2.3 Comparative Assessment

**New programming language**

- Strength: maximal design freedom and coherence.
- Risk: highest complexity and adoption burden.
- Typical failure: spending years on language mechanics before proving user value.

**Constrained profile over HTML/CSS/TS**

- Strength: low migration cost and immediate platform alignment.
- Risk: may feel less "novel" and can hit expressiveness limits.
- Typical failure: weak enforcement if rules are only style guidance.

**Compiler plus conventions spec**

- Strength: explicit contracts, diagnostics, and enforceable constraints.
- Risk: requires careful IR/design to avoid accidental framework behavior.
- Typical failure: convention drift without strict spec test suite.

**Protocol and manifest ecosystem**

- Strength: can unify tooling without forcing one syntax.
- Risk: can become too abstract and underspecified for authoring UX.
- Typical failure: ecosystem fragmentation around competing front-end syntaxes.

### 2.4 v1 Position

Weblang should currently be treated as a **spec-led authoring profile with a compiler contract**, not necessarily a fully separate general-purpose language in v0.

This framing preserves optionality:

- If profile plus compiler succeeds, Weblang can remain lightweight and durable.
- If structural limits appear, syntax can evolve with evidence.

## 3. Paradigm Landscape: Historical and Current Approaches

This section summarizes major approaches, where they excel, and where they fail relative to Weblang goals.

### 3.1 Imperative DOM (jQuery-era)

Excels:

- Direct platform API usage.
- Minimal hidden runtime semantics.
- Easy to inspect resulting DOM behavior.

Falls short:

- Weak locality at scale.
- No native type model for HTML/CSS.
- Repetitive event and query boilerplate.
- Accessibility and testing are mostly manual discipline.

### 3.2 Template/MVC Server Rendering

Excels:

- Strong server-first and progressive enhancement baseline.
- HTML-first authoring and robust initial render behavior.

Falls short:

- Behavior and style ownership often split across distant files.
- Inconsistent hydration/adoption semantics.
- Type and test contracts vary by stack.

### 3.3 SPA Frameworks

Excels:

- High productivity for complex interactive apps.
- Component abstractions and ecosystem maturity.

Falls short:

- Heavy abstraction layers can hide platform behavior.
- Runtime and build complexity.
- Accessibility often policy-driven, not default-guaranteed.
- Output inspectability decreases as abstraction increases.

### 3.4 Compile-Time Reactive Frameworks

Excels:

- Better runtime efficiency and smaller output.
- Improved colocated authoring experiences.

Falls short:

- Custom semantics can still drift from native mental models.
- Implicit reactivity can obscure causal flow for maintenance and AI edits.

### 3.5 Web Components

Excels:

- Native platform standard.
- Encapsulation and interoperability.

Falls short:

- Boilerplate and lifecycle complexity.
- Shadow boundary tradeoffs for styling, testing, and accessibility ergonomics.
- Does not, by itself, define a higher-level composition language.

### 3.6 Hypermedia/Attribute-Driven Approaches

Excels:

- Strong locality of behavior for many interactions.
- Server-first alignment and low client complexity.

Falls short:

- Limited integrated model for scoped CSS, type contracts, and asset semantics.
- Harder to standardize feature-level compile contracts.

### 3.7 Server-First Islands and Hybrid Rendering

Excels:

- Performance and progressive enhancement benefits.
- Controlled client-side hydration scope.

Falls short:

- Boundary complexity between server and client ownership.
- Multiple model layers can reduce clarity.

### 3.8 Typed CSS/HTML and Tooling Ecosystem Efforts

Excels:

- Strong targeted safety improvements.
- Practical integration with existing stacks.

Falls short:

- Usually point solutions, not a holistic feature-composition model.
- Cross-layer guarantees remain fragmented.

## 4. Goal-by-Goal Analysis

### 4.1 Locality and Clarity of Behavior

Current solutions:

- Component file colocation.
- Attribute-driven behavior declarations.
- Partial co-location via framework conventions.

Where they excel:

- Reduced navigation overhead.
- Easier local reasoning in simple cases.

Where they fail:

- Hidden behavior through global state, implicit lifecycle rules, and indirect styling.
- "Spooky action at a distance" remains common.

Weblang implication:

- Prefer explicit feature boundaries and explicit lifecycle hooks.
- Favor deterministic, observable behavior contracts.

### 4.2 Type Safety Across HTML, CSS, JS/TS

Current solutions:

- TypeScript for behavior.
- Lint/type plugins for templates and CSS.
- CSS parser/transforms for syntax correctness.

Where they excel:

- Strong JS/TS safety.
- Good diagnostics in mature toolchains.

Where they fail:

- HTML/CSS typing is weaker and inconsistent.
- Cross-layer contracts are often informal.

Weblang implication:

- Treat HTML/CSS typing as first-class compile concerns.
- Define cross-layer type boundaries and diagnostics taxonomy.

### 4.3 Testing as First-Class

Current solutions:

- E2E and component test runners (Playwright, Cypress, Selenium).
- Selector and fixture conventions.

Where they excel:

- Mature ecosystem and CI workflows.
- Strong browser-level confidence.

Where they fail:

- Flakiness and selector fragility remain frequent.
- Testability is often retrofitted, not language-influencing.

Weblang implication:

- Bake deterministic mount/adopt contracts and stable test hooks into compile output.
- Standardize test-manifest metadata.

### 4.4 Accessible-by-Default

Current solutions:

- ARIA guidance, linting, audits, and accessibility testing tools.
- Semantic HTML best-practice education.

Where they excel:

- Clear standards and rich testing ecosystems.

Where they fail:

- Late-stage validation catches issues after architectural choices.
- Accessibility can become optional policy, not structural default.

Weblang implication:

- Semantic HTML should be baseline authoring contract.
- Compiler/editor diagnostics should surface common semantic and ARIA issues early.
- Define explicit boundaries for auto-fixes to avoid unsafe transformations.

### 4.5 AI-First Authoring

Current solutions:

- LLM-assisted coding over existing code conventions.
- Tool-specific generation and refactoring helpers.

Where they excel:

- Fast draft generation and repetitive code transformation.

Where they fail:

- Ambiguous syntax and diagnostics increase hallucinations and risky edits.

Weblang implication:

- Keep grammar regular and explicit.
- Provide deterministic diagnostic codes and fix hints.
- Preserve stable generated output mapping for explainability.

### 4.6 Assets as Core Concern

Current solutions:

- Bundler-managed asset graphs.
- Framework-specific asset loaders and conventions.

Where they excel:

- Optimization and hashing pipelines.

Where they fail:

- Asset semantics are typically tool-level, not language-level.
- Metadata and content concerns become fragmented.

Weblang implication:

- Define first-class asset contracts and manifests.
- Include images, video, audio, fonts, and metadata pipelines in core model.

### 4.7 Standard Output and Minimal Magic

Current solutions:

- Build tools already produce standard JS/CSS/HTML assets.

Where they excel:

- Compatibility and portability.

Where they fail:

- Authoring abstractions can still obscure runtime behavior.

Weblang implication:

- No proprietary runtime requirement.
- Output should be auditable and platform-native.

## 5. Structure and Syntax Options for Weblang

### Option A: Feature Block File (current direction)

Sketch:

```weblang
feature Counter {
  html { ... }
  css { ... }
  ts { ... }
}
```

Pros:

- Excellent locality.
- Explicit ownership across structure/style/behavior.
- Strong foundation for compile diagnostics.

Cons:

- Requires parser and tooling investment.
- Needs precise interpolation and lifecycle semantics.

### Option B: HTML-First with Embedded Directives

Sketch:

- Keep mostly native HTML files with scoped behavior/style directives.

Pros:

- Lowest adoption friction.
- Strong progressive enhancement fit.

Cons:

- Harder to enforce cross-layer type/test/accessibility contracts uniformly.
- Can devolve into directive sprawl.

### Option C: Manifest-First + Generated Artifacts

Sketch:

- Declare feature graph and contracts in manifest files; generate implementation stubs.

Pros:

- Strong machine readability and tool interoperability.

Cons:

- Weak direct authoring ergonomics.
- Adds indirection, harming locality.

### v1 Recommendation

Adopt **Option A** for v0 exploration, with strict limits:

1. Keep grammar small.
2. Avoid implicit reactivity.
3. Preserve explicit DOM mutation model.
4. Defer advanced templating control flow.

## 6. Blindspots and Hidden Complexity

The following are likely complexity multipliers and should be tracked explicitly.

### High Priority Blindspots

1. Adopt-mode semantics with pre-rendered DOM.
2. CSS scoping versus native cascade behavior.
3. Accessibility auto-remediation boundaries and false confidence risk.
4. Cross-file type contracts between feature blocks and assets.
5. Testing determinism under async behavior and network variability.
6. Trusted Types, CSP, and unsafe HTML escape hatches.

### Medium Priority Blindspots

1. Source map fidelity across mixed HTML/CSS/TS blocks.
2. Performance overhead of diagnostics in large codebases.
3. Browser baseline and polyfill strategy.
4. Asset metadata correctness across build targets.

### Lower Priority but Important Blindspots

1. Formatting and style conventions for long-term maintainability.
2. Spec evolution and versioning governance model.
3. Editor integration edge cases and ecosystem plugin drift.

## 7. Comprehensive Unknowns for Further Research

Each unknown includes a proposed experiment direction.

### 7.1 Language Framing Unknowns

1. Is a dedicated parser materially better than a profile over existing syntax?
   Experiment: build small prototypes for both and compare diagnostics quality and implementation complexity.

2. What is the minimum grammar that still enables all goals?
   Experiment: define v0 grammar and run against canonical examples and edge-case suites.

### 7.2 Type System Unknowns

1. How strict can HTML typing be before developer friction becomes unacceptable?
   Experiment: introduce graduated strictness levels and measure error usefulness versus false positives.

2. Which CSS value/type checks produce high signal versus noise?
   Experiment: implement candidate checks on real project CSS corpus.

### 7.3 Accessibility Unknowns

1. Which accessibility checks should be compile-native versus plugin-provided?
   Experiment: split checks into semantic-structural versus behavioral-runtime classes and benchmark usefulness.

2. Which auto-fixes are safe by default?
   Experiment: evaluate fix precision on known accessibility issue datasets.

### 7.4 Testing Unknowns

1. What metadata is required for stable, framework-agnostic test manifests?
   Experiment: generate manifests for canonical examples and consume them in Playwright and Cypress.

2. How should Weblang represent async lifecycle boundaries for deterministic testing?
   Experiment: define lifecycle trace events and evaluate flake reduction.

### 7.5 Asset Unknowns

1. Should assets be declared in syntax blocks, imports, or both?
   Experiment: compare readability and tooling complexity for both approaches.

2. How should sitemap and metadata generation integrate with feature boundaries?
   Experiment: prototype metadata manifest generation from feature graph.

### 7.6 AI-First Unknowns

1. Which diagnostic format best supports safe AI refactors?
   Experiment: structured error code plus fix-hint schema with small AI editing benchmark.

2. How can Weblang reduce hallucination risk in generated edits?
   Experiment: enforce canonical file layout and deterministic compiler messages; measure correction loop length.

## 8. Proposed Research Program (90 Days)

### Phase 1: Definition (Weeks 1-4)

- Freeze v0 candidate grammar.
- Define lifecycle and interpolation safety semantics.
- Define diagnostic taxonomy draft.

Deliverables:

- Grammar draft.
- Lifecycle state model.
- Diagnostic code registry v0.

### Phase 2: Prototyping (Weeks 5-8)

- Implement parser and minimal compiler path.
- Add baseline HTML/CSS diagnostics.
- Add accessibility diagnostics subset.
- Emit JS/CSS/HTML outputs and source maps.

Deliverables:

- Compiler prototype.
- Canonical examples compile pipeline.
- Initial accessibility and type safety reports.

### Phase 3: Validation (Weeks 9-12)

- Integrate Playwright and Cypress proof workflows.
- Evaluate AI-edit reliability using deterministic diagnostics.
- Validate asset handling and manifest design.

Deliverables:

- Test-manifest proposal.
- Asset-manifest proposal.
- Decision memo: remain profile/spec or evolve syntax scope.

## 9. Decision Gates

By the end of the 90-day cycle, decide the long-term framing using evidence:

1. If profile plus compiler meets quality thresholds, keep Weblang as a constrained spec-led profile.
2. If profile cannot express core guarantees without excessive complexity, expand into a fuller language definition.

Quality thresholds should include:

- Accessibility diagnostics precision.
- Type and test signal quality.
- Compile-output inspectability.
- AI-assisted edit reliability.

## 10. Risks and Tradeoffs

1. Scope creep risk from trying to solve every web problem at once.
2. False certainty risk from overpromising type/accessibility automation.
3. Migration risk if syntax changes too quickly.
4. Tooling lock-in risk if implementation couples too tightly to one pipeline.

Mitigations:

- Keep v0 strict and small.
- Publish explicit non-goals each phase.
- Separate normative spec from optional tooling modules.

## 11. Ratified v0 Acceptance Criteria

The v0 path is accepted when all criteria below pass in a single run.

1. Grammar/default model conformance
   - Source files use one feature per `.weblang` file in default mode.
   - Feature member order is `html`, optional `css`, then one behavior block (`ts` or `js`).
   - Default behavior is explicit DOM mutation with no implicit reactivity.

2. Canonical spike coverage
   - The canonical set includes Counter, Tabs, and Users.
   - Each feature compiles to standard output artifacts.

3. Output contract
   - Emit one HTML artifact, one CSS artifact, and one ESM JS artifact per feature.
   - Emit machine-readable diagnostics in deterministic JSON format.

4. Diagnostics contract
   - Error-level diagnostics MUST be zero for acceptance.
   - Accessibility diagnostics MUST include at least baseline role/attribute checks.
   - Diagnostic records include: code, severity, message, file, line, column, and optional hint/docs.

5. Runtime behavior checks
   - Counter interaction increments state and updates visible output.
   - Tabs interaction updates `aria-selected` and panel visibility.
   - Users flow handles async loading, renders list items, and reports status text.

6. Validation against Master Plan goals
   - Locality and clarity demonstrated by one-feature units.
   - Testing is executable as part of the spike pipeline.
   - Accessible-by-default checks run in compile/validation flow.
   - Standard output remains inspectable and runtime-agnostic.

Current status (2026-03-18): PASS via `spikes/v0` pipeline.

## 12. Minimal Toolchain Path (Proceed)

The minimal standalone toolchain now proceeds from the passing spike:

1. Authoring inputs
   - `.weblang` source files in `spikes/v0/src`.

2. Compiler entrypoint
   - `spikes/v0/compiler/index.mjs` parses feature blocks, applies default model checks, emits scoped HTML/CSS/JS, and writes diagnostics.

3. Validation entrypoint
   - `spikes/v0/scripts/validate-spike.mjs` recompiles, checks required artifacts, enforces acceptance rules, and emits report files.

4. Runtime test entrypoint
   - `spikes/v0/tests/spike.runtime.test.mjs` executes feature behavior checks in a DOM-like environment.

5. Top-level workflow
   - `pnpm --dir spikes/v0 run spike` is the ratification command for v0 prototype acceptance.

Next implementation increment:

1. Replace heuristic CSS checks with standards-backed parsing (Lightning CSS).
2. Add TS block type-checking integration for emitted behavior code.
3. Extend diagnostics coverage and fix-hint quality.
4. Add optional test/asset manifest emission to close Milestone B gaps.

## Appendix A: Research References

1. Locality of Behaviour essay: https://htmx.org/essays/locality-of-behaviour/
2. MDN Web Components overview: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
3. React docs (component and JSX model): https://react.dev/learn
4. Svelte overview (compile-time component model): https://svelte.dev/docs/svelte/overview
5. Vite guide (dev/build and plugin model): https://vite.dev/guide/
6. Lightning CSS overview and docs: https://lightningcss.dev/
7. Playwright docs and capabilities: https://playwright.dev/
8. Cypress docs and platform overview: https://www.cypress.io/
9. WCAG 2.2 (accessibility baseline): https://www.w3.org/TR/WCAG22/
10. ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
11. Trusted Types and CSP context: https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API

## Appendix B: Terms

- Locality of behavior: behavior is understandable from the local unit.
- Adopt mode: feature binds to pre-existing DOM.
- Create mode: feature creates owned DOM.
- Accessible-by-default: semantic and operable output baseline without opt-in add-ons.
- AI-first: language and tooling choices optimized for deterministic machine collaboration.
