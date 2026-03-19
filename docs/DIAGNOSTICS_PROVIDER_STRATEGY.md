# Weblang Diagnostics Provider Strategy

Date: 2026-03-18
Status: Draft for Spike v3

## 1. Decision Snapshot

Weblang should not implement full HTML, CSS, or accessibility standards validation from scratch.

Weblang should use provider-backed diagnostics for standards-heavy checks and keep compiler-native diagnostics for language-specific rules.

Rationale:

- Keeps implementation scope focused on language semantics and deterministic output.
- Reduces maintenance burden of tracking evolving web standards.
- Aligns with existing plan to leverage mature ecosystem tools.

## 2. Proposed Spec Delta

Add a diagnostics provider contract as part of compile-time validation.

Normative behavior:

1. Compiler MUST produce a single deterministic diagnostics stream in Weblang schema.
2. Compiler MUST support both compiler-native diagnostics and provider diagnostics.
3. Provider diagnostics MUST be normalized into Weblang codes and severities.
4. Provider version changes MUST NOT silently alter Weblang code identifiers.
5. Compiler MUST preserve source file, line, and column in normalized diagnostics where available.

Provider categories:

- HTML provider: element/attribute and structural validity checks.
- CSS provider: parser/validation checks.
- TS/JS provider: behavior block type checks.
- A11Y provider: semantic and ARIA baseline checks.

Code-space guidance:

- Compiler-native examples: WL-GRAMMAR-_, WL-RUNTIME-_.
- Provider-normalized examples: WL-HTML-_, WL-CSS-_, WL-TS-_, WL-A11Y-_.

## 3. Ecosystem Compatibility Impact

Preferred integration direction:

- CSS: Lightning CSS for parsing and syntax validation.
- TS/JS: TypeScript compiler API for behavior checking.
- HTML: evaluate parser + validator stack via adapter.
- A11Y: evaluate static checks with optional runtime-grade validation support.

Compatibility outcome:

- Preserves standard web output artifacts.
- Avoids lock-in to one framework runtime.
- Enables replacement of provider implementations without changing author-facing Weblang diagnostic schema.

## 4. Accessibility, Security, and Complexity Tradeoffs

Accessibility:

- Provider-backed a11y checks improve baseline coverage quickly.
- Weblang still needs compiler-native rules for lifecycle/locality-specific accessibility semantics.

Security:

- Provider model does not replace Weblang security defaults.
- Unsafe HTML insertion and CSP/Trusted Types constraints remain compiler policy decisions.

Complexity:

- Short-term integration complexity increases due to adapter and normalization layers.
- Long-term maintenance complexity decreases versus building standards engines in-house.

Determinism risk:

- Third-party rule text may change between versions.
- Mitigation: pin provider versions and snapshot normalized output in tests.

## 5. Next Experiment (Spike v3)

Goal: run a buy-vs-build diagnostics adapter experiment with deterministic outputs.

Scope:

1. Introduce provider adapter interface in spike compiler.
2. Wire CSS provider and one HTML provider candidate.
3. Normalize provider output into stable Weblang diagnostics schema.
4. Add deterministic snapshot tests for invalid fixture corpus.
5. Compare candidate providers on coverage, false positives, and source mapping quality.

Success criteria:

- Deterministic diagnostics across repeated runs.
- Stable Weblang diagnostic codes independent of provider raw ids.
- No regression on canonical feature pipeline.
- Clear recommendation for HTML and A11Y provider adoption path.
