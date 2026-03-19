---
description: 'Use when brainstorming Weblang language design, writing mini-spec or RFC content, or deciding syntax and lifecycle semantics.'
name: 'Weblang Design Workflow'
---

# Weblang Design Workflow

## Intent

Use this guidance for language design discussions so outputs stay concrete, comparable, and implementation-ready.

## Required Output Shape

1. Decision snapshot.
2. Spec delta.
3. Ecosystem compatibility impact.
4. Accessibility, security, and complexity tradeoffs.
5. Next experiment.

## Design Defaults

- Prefer platform-native APIs and explicit DOM operations.
- Keep feature-level locality as the main organizing principle.
- Avoid introducing hidden reactivity.
- Keep semantics deterministic at mount time unless live updates are explicitly designed.
- Favor accessible-by-default behavior through semantic HTML, keyboard support, and predictable focus flow.

## Compatibility Rules

- Describe compatibility with standard web tooling and browser platform constraints.
- Call out migration implications for existing web codebases.

## Spec Writing Rules

- Separate normative language from rationale.
- Use short, testable statements.
- Add at least one concrete example per new rule.
- Add explicit accessibility implications for non-trivial semantics and lifecycle decisions.
