---
description: 'Use when creating or editing .weblang examples (and legacy .lob examples) for features like Counter, Tabs, Users, Todo, Avatar, and related web-native composition demos with accessible-by-default behavior.'
name: 'Weblang Example Authoring'
applyTo:
  - 'export-1/**/*.lob'
  - '**/*.weblang'
---

# Weblang Example Authoring

## Goals

- Keep examples minimal and runnable.
- Demonstrate locality of behavior directly in each feature.
- Use platform APIs instead of framework abstractions.
- Start from semantic HTML and accessible-by-default behavior.

## Authoring Conventions

- Prefer one feature per file for clarity.
- Keep block order as html, css, then ts or js unless there is a strong reason not to.
- Use semantic selectors and avoid brittle deep selector chains.
- Use cleanup for abort controllers, timers, and external listeners.
- Preserve keyboard interaction parity for click-driven UI patterns.

## Props and Template Rules

- If using imperative prop wiring, keep selectors stable and obvious.
- If exploring interpolation syntax, treat it as opt-in and include escaping assumptions.
- Do not use raw unsafe html insertion by default.

## Example Quality Checklist

- Includes one clear interaction.
- Includes one clear visual or semantic state change.
- Shows error or loading behavior for async examples.
- Uses semantic elements and necessary ARIA attributes only when semantics alone are insufficient.
- Includes at least one keyboard interaction path when behavior is interactive.
- Can be understood without external framework context.
