# Weblang Syntax Comparison: feature block vs plain HTML

Date: 2026-03-18
Status: Working note

## Context

This document compares two authoring styles for the same UI behavior:

1. Weblang feature block syntax
2. Plain HTML with inline `<style>` and `<script lang="ts">`

The goal is to clarify what concrete benefits the feature syntax provides beyond what is possible with regular platform files.

## Side-by-side forms

### A. Feature block style

```weblang
// counter.weblang
feature Counter {
  html { ... }
  css { ... }
  ts { ... }
}
```

### B. Plain HTML style

```html
<!-- counter.html -->
<button class="btn" type="button" aria-live="polite">
	Count:
	<span class="n">0</span>
</button>

<style>
	.btn {
		font: inherit;
		padding: 0.5rem 0.75rem;
	}
</style>

<script lang="ts">
	let n = 0
	const btn = root.querySelector('.btn')! as HTMLButtonElement
	const out = root.querySelector('.n')!

	btn.addEventListener('click', () => {
		n += 1
		out.textContent = String(n)
	})
</script>
```

## Main benefits of feature syntax

1. Explicit ownership unit

- `feature` defines one compositional unit with clear boundaries.
- This makes structure, style, and behavior ownership explicit rather than conventional.

2. Deterministic compiler contract

- The compiler can rely on known block slots (`html`, `css`, `ts/js`).
- This enables strict, enforceable rules (single html block, single behavior block, create/adopt mode).

3. Better diagnostics quality

- Errors can be scoped by concern (`GRAMMAR`, `HTML`, `CSS`, `TS`, `A11Y`, `RUNTIME`).
- Messages are usually more precise because the language shape is constrained.

4. First-class lifecycle semantics

- `feature` naturally supports `create` vs `adopt` ownership and mount/unmount behavior.
- Equivalent behavior in raw HTML often depends on ad hoc conventions.

5. Stronger default scoping model

- CSS scoping is part of the feature contract, not an optional style pattern.
- This reduces accidental global cascade collisions.

6. Better path to type safety across layers

- HTML/CSS/TS checks can be tied to one feature-level compile pass.
- In plain HTML stacks, checks are often fragmented across multiple tools.

7. Accessibility and testing integration points

- Feature boundaries are natural anchors for a11y diagnostics and test-manifest generation.
- This aligns with Weblang goals for accessible-by-default and first-class testing.

8. Improved AI and tooling reliability

- Regular structure is easier for editor tooling and AI to parse and transform safely.
- Fewer ambiguous patterns reduce risky edits.

## What plain HTML does well

1. Lowest syntax overhead

- No new language surface for authors to learn.

2. Immediate platform familiarity

- Uses established web primitives directly.

3. Great for small or one-off pages

- Useful when strict compile contracts are unnecessary.

## Key caveat highlighted by the counter example

In the plain HTML example, `root` is not a native browser binding. It requires extra runtime/tooling convention.

In feature syntax, `root` is part of the language runtime contract, which removes ambiguity and improves portability of authored behavior.

## Decision guidance

Prefer feature syntax when:

- You need strong compile-time guarantees.
- You want standardized lifecycle, diagnostics, and scoping behavior.
- You are optimizing for maintainability and AI-safe transformations.

Prefer plain HTML style when:

- You need minimal ceremony for simple pages.
- You do not need strict feature-level contracts.
- Team constraints favor pure existing syntax with lighter tooling.

## Current recommendation for Weblang

For v0 exploration, keep `feature { html/css/ts }` as the default authoring contract.

Reason:

It best satisfies the active Weblang goals (type safety, testing, accessible-by-default output, deterministic diagnostics, and standard platform output) while keeping syntax compact and explicit.
