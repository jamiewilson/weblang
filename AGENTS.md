# WebLang Collaboration Guide

## Mission

This workspace explores a web-native programming and composition language for HTML, CSS, and JS or TS with strong locality of behavior.

Use Weblang as the current working label.

## Product Context

- Develop Weblang in isolation as its own language effort.
- Optimize for web platform primitives, low magic, and inspectable output.

## Core Principles

- Keep HTML, CSS, and JS or TS as first-class syntax.
- Favor minimal abstraction over framework-like indirection.
- Prioritize locality of behavior.
- Treat accessible-by-default output as a primary goal, starting with semantic HTML.
- Preserve progressive enhancement and server-first workflows.
- Compile to standard platform artifacts (ESM JS, CSS, HTML-compatible output).

## Current Language Shape

- Main unit: feature.
- Typical blocks: html, css, ts or js.
- Runtime bindings: root, props, cleanup, emit.
- Lifecycle direction: instantiate, render or adopt, attach styles, run behavior, mount, unmount.
- DOM ownership: create mode and adopt mode.
- CSS direction: scoped output via generated scope attribute.

## Template and Props Guidance

- Baseline is explicit DOM mutation in behavior blocks.
- Limited interpolation in html is allowed as an exploration path, but keep it constrained.
- If interpolation is proposed, default to escaped text and safe attribute string or boolean values.
- Avoid introducing implicit reactivity unless explicitly requested.

## Collaboration Workflow

When contributing design ideas, produce these sections in order:

1. Decision snapshot: what changed and why.
2. Proposed spec delta: exact behavior additions, removals, or clarifications.
3. Risks and tradeoffs: security, complexity, migration, and performance.
4. Worked examples: author input and expected compiled behavior.
5. Open questions: unresolved choices for next iteration.

## Guardrails

- Do not invent large runtimes, virtual DOM systems, or custom CSS dialects unless asked.
- Do not hide behavior behind implicit magic.
- Keep security and CSP compatibility explicit.
- Keep accessibility explicit with semantic elements, keyboard support, and clear ARIA behavior.
- Keep examples executable and close to platform APIs.

## Source of Truth

- Prior brainstorming source: export-1/wed_mar_18_2026_proposal_for_a_new_web_native_programming.md
- Example language fragments: export-1/_.lob (legacy) and _.weblang (target)
