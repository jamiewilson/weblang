# Weblang Authoring Strategy Comparison

Date: 2026-03-18
Status: Working draft
Purpose: Evaluate whether Weblang should use a special syntax, a TypeScript/JavaScript superset, or a plain TypeScript-hosted approach.

## 1. Decision Question

Should Weblang define its own source syntax (`.weblang`), or should it be expressed as:

1. A superset of TypeScript (or JavaScript).
2. Plain TypeScript with library/compiler conventions.
3. Plain HTML/CSS/TS conventions only.

This document compares those paths against Weblang goals:

- locality and clarity of behavior
- type safety across HTML/CSS/TS
- testing as first-class
- accessible-by-default output
- AI-first ergonomics
- first-class assets
- standard platform output

## 2. Approach A: Special Weblang Syntax (`feature { html css ts }`)

Summary:

A dedicated authoring grammar with explicit blocks and lifecycle semantics.

### Pros

1. Strongest structural guarantees.

- Compiler can enforce exact shape and rules.
- Easier to produce deterministic diagnostics.

2. Best cross-layer contracts.

- HTML/CSS/TS are first-class in one unit.
- Easier to attach type, a11y, and testing rules to one feature boundary.

3. Clear lifecycle and ownership semantics.

- `create` and `adopt` can be language-level, not convention-level.

4. Better AI/tooling reliability.

- Regular, constrained syntax improves safe transforms and codegen consistency.

### Cons

1. New language surface.

- Requires parser, formatter, language tooling, and onboarding docs.

2. Migration friction.

- Existing teams must adopt new file type and rules.

3. Ecosystem bootstrap cost.

- Syntax highlighting, LSP features, and formatter maturity take time.

### Primary risk

- Over-designing syntax before proving value with real workloads.

## 3. Approach B: TypeScript Superset (Weblang syntax extends TS/JS)

Summary:

Use TS/JS as the host language and add new grammar constructs for Weblang features.

### Pros

1. Familiar host language.

- Lower cognitive overhead for TS-heavy teams.

2. Reuse TS parser/tooling patterns partially.

- Potentially faster path for type and diagnostics integration.

3. Keeps behavior model close to existing TS ecosystems.

### Cons

1. Grammar complexity can spike quickly.

- Mixing HTML/CSS constructs into TS grammar can get brittle.
- Error recovery and parser edge cases become harder.

2. Risk of unclear boundaries.

- Harder to keep HTML/CSS as truly first-class without awkward embedding forms.

3. Tooling ambiguity.

- Existing TS tooling may not understand custom grammar extensions without deep customization.

4. Can inherit TS-centric bias.

- Might under-serve HTML/CSS-centric authoring and accessibility semantics.

### Primary risk

- Building a hybrid grammar that is neither clean TS nor clean Weblang.

## 4. Approach C: Plain TypeScript Host API (no new grammar)

Summary:

Define Weblang through TS functions/APIs and compiler conventions, for example feature declarations via object literals and template strings.

### Pros

1. Lowest parser complexity.

- No new grammar required for v0.

2. Excellent TS tool compatibility.

- Leverages existing TS editor and type infrastructure immediately.

3. Fast prototyping.

- Easy to test lifecycle/test/a11y manifests early.

### Cons

1. Weak syntax-level guarantees.

- Contracts depend on conventions and runtime/library APIs.

2. HTML/CSS first-class goal becomes harder.

- Usually represented as strings/templates, reducing structural fidelity.

3. Diagnostics are less precise.

- Harder to provide rich, domain-specific messages tied to real syntax nodes.

4. Accessibility and test contracts are easier to bypass.

- Enforcement tends to be lint-level, not language-level.

### Primary risk

- Ending up as a library pattern rather than a durable authoring model.

## 5. Approach D: Plain HTML/CSS/TS Conventions

Summary:

No new grammar and no host API abstraction beyond conventions plus tooling plugins.

### Pros

1. Maximum familiarity.
2. Minimal adoption friction.
3. Fully platform-native source representation.

### Cons

1. Weakest enforceability.

- Most guarantees become optional guidelines.

2. Fragmented contracts.

- Type safety, a11y, testing, and asset semantics remain split across tools.

3. Lower AI reliability.

- More ambiguous structure and conventions increase transform risk.

### Primary risk

- Does not reliably meet Weblang’s top-level goals as defined.

## 6. Comparative Matrix

Scores are relative for Weblang goals (Higher is better).

| Criterion                               | A: Special Syntax | B: TS Superset | C: Plain TS Host API | D: Plain HTML/TS Conventions |
| --------------------------------------- | ----------------: | -------------: | -------------------: | ---------------------------: |
| Locality clarity                        |              High |         Medium |               Medium |                   Low-Medium |
| Cross-layer type safety potential       |              High |    Medium-High |               Medium |                   Low-Medium |
| Accessibility-by-default enforceability |              High |         Medium |           Medium-Low |                          Low |
| Testing-first contract strength         |              High |         Medium |               Medium |                          Low |
| AI transform reliability                |              High |         Medium |               Medium |                   Low-Medium |
| Adoption friction                       |        Medium-Low |         Medium |                  Low |                       Lowest |
| Tooling bootstrap cost                  |           Highest |           High |                  Low |                       Lowest |
| Long-term spec clarity                  |              High |         Medium |           Medium-Low |                          Low |

## 7. What a TS Superset Does Well (and Where It Breaks)

A TS superset is worth discussing and may be useful as a transitional strategy, especially if early implementation speed is the top constraint.

It breaks down when:

1. HTML/CSS need true structural analysis rather than string/template analysis.
2. Lifecycle ownership must be guaranteed by syntax, not conventions.
3. Accessibility diagnostics require strongly typed semantic trees at compile time.
4. AI-safe deterministic transforms require a narrow, unambiguous grammar.

## 8. Recommended Path for Weblang

Near-term recommendation:

1. Keep special Weblang syntax as the target model (Approach A).
2. Permit an experimental TS-hosted prototype track (Approach C) to validate runtime contracts quickly.
3. Do not commit to full TS superset grammar (Approach B) unless a concrete parser/tooling advantage is proven.

Why:

- Approach A best matches the explicit goals in the master plan.
- Approach C can derisk implementation sequencing without locking architecture.
- Approach B has high complexity risk for unclear long-term payoff.

## 9. Decision Gates

Use evidence to choose by end of v0 prototype cycle.

Gate 1: Contract quality

- Can the approach enforce lifecycle, diagnostics, and scoping without convention drift?

Gate 2: Safety quality

- Are type/a11y diagnostics precise and stable enough for default use?

Gate 3: DX and AI quality

- Can editors and AI agents perform safe transforms with low ambiguity?

Gate 4: Output integrity

- Is compiled output fully standard, inspectable, and predictable?

If Approach C passes all gates with minimal complexity, maintain hybrid strategy longer.
If it fails on contract enforceability, prioritize Approach A as the default path.

## 10. Follow-up Research Tasks

1. Build a tiny Approach C prototype for one canonical example and compare diagnostics quality to Approach A.
2. Benchmark parser and tooling effort for Approach B before committing to superset grammar.
3. Define objective acceptance metrics for accessibility and testing contracts across approaches.
4. Record migration implications from plain HTML projects into each approach.
