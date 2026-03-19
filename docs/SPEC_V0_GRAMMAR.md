# Weblang v0 Spec Draft: Grammar and Runtime Semantics

Date: 2026-03-18
Status: Draft v0 (experimental)
Scope: Core authoring grammar, lifecycle, diagnostics contract

## 1. Decision Snapshot

Weblang v0 is defined as a spec-led authoring profile with a compiler contract.

Ratified v0 default authoring model:

1. Authors write one `feature` per `.weblang` file.
2. Feature block order is `html`, optional `css`, then exactly one behavior block (`ts` preferred, `js` allowed).
3. Default ownership is `create` mode.
4. Default CSS scoping is generated attribute scope.
5. Default template interpolation is disabled (`templateExpr: off`).
6. Behavior uses explicit DOM mutation through platform APIs.
7. Accessibility and diagnostics are compile-time responsibilities, with deterministic machine-readable output.

The v0 grammar stays intentionally small and explicit:

- Main unit: `feature`
- Primary blocks: `html`, `css`, `ts` or `js`
- Runtime bindings: `root`, `props`, `cleanup`, `emit`
- DOM ownership: `create` and `adopt`

v0 prioritizes deterministic behavior, standard web output, and accessible-by-default semantics over expressiveness.

## 2. Proposed Spec Delta

This document defines the first normative contract for `.weblang` files.

## 2.1 File and Module Rules

1. Source files use `.weblang` extension.
2. A module SHOULD contain exactly one `feature` declaration in the ratified default path.
3. A module MAY contain more than one `feature` declaration only as a non-default advanced authoring mode.
4. `import` and `export` statements MAY appear at module scope.
5. Parser behavior MUST be deterministic and independent of runtime state.

## 2.2 Core Grammar (EBNF Draft)

```ebnf
Module           ::= (ImportDecl | ExportDecl | FeatureDecl)*

FeatureDecl      ::= "feature" Identifier FeatureBody
FeatureBody      ::= "{" FeatureMember* "}"

FeatureMember    ::= PropsBlock
                   | HtmlBlock
                   | CssBlock
                   | JsBlock
                   | TsBlock
                   | MountBlock
                   | UnmountBlock
                   | UseBlock

PropsBlock       ::= "props" "{" PropDecl* "}"
PropDecl         ::= Identifier ":" TypeRef ("=" DefaultExpr)? ";"

HtmlBlock        ::= "html" BlockText
CssBlock         ::= "css" BlockText
JsBlock          ::= "js" BlockText
TsBlock          ::= "ts" BlockText

MountBlock       ::= "mount" BlockText
UnmountBlock     ::= "unmount" BlockText

UseBlock         ::= "use" "{" UseEntry* "}"
UseEntry         ::= "mode" ":" ("create" | "adopt") ";"
                   | "scope" ":" ("attribute" | "shadow") ";"
                   | "templateExpr" ":" ("off" | "safe") ";"

BlockText        ::= "{" RawContent "}"
Identifier       ::= /* language identifier */
TypeRef          ::= /* TS-compatible type reference */
DefaultExpr      ::= /* TS-compatible expression */
```

### v0 restrictions

1. Exactly one `html` block per feature.
2. At most one style block (`css`) per feature.
3. Exactly one behavior block (`js` or `ts`) per feature.
4. `js` and `ts` MUST NOT both appear in the same feature.
5. Unknown top-level feature members are compile errors.
6. In the ratified default path, member ordering MUST be `html` -> `css` (if present) -> `ts` or `js`.

## 2.3 Runtime Bindings

The behavior context for each feature instance MUST expose:

1. `root`: feature root element in live DOM.
2. `props`: resolved input object.
3. `cleanup(fn)`: registers teardown callback.
4. `emit(name, detail?)`: dispatches `CustomEvent` with `bubbles: true`.

`cleanup` callbacks MUST execute during unmount in reverse registration order.

## 2.4 Lifecycle Semantics

Feature instance lifecycle is normative:

1. Instantiate.
2. Resolve props.
3. Resolve ownership mode (`create` default, or `adopt`).
4. Materialize or bind DOM root.
5. Attach scoped styles.
6. Evaluate behavior block (`js` or `ts`) once.
7. Run `mount` block if present.
8. On dispose, run `cleanup` callbacks.
9. Run `unmount` block if present.

### Ownership modes

- `create`: compiler/runtime creates DOM from `html` block.
- `adopt`: runtime binds to pre-existing DOM subtree.

v0 ratified default is `create` mode. `adopt` is supported but non-default.

In `adopt` mode, absence of required root target is a runtime error with code `WL-RUNTIME-ADOPT-001`.

## 2.5 HTML and Interpolation Rules

v0 default: `templateExpr: off`.

- `html` block content is treated as static HTML template source.
- No inline expression parsing is performed in default mode.

Optional experimental mode: `templateExpr: safe`.

In `safe` mode:

1. Text interpolation outputs escaped text only.
2. Attribute interpolation permits string and boolean results only.
3. Raw HTML insertion is forbidden unless explicit unsafe API is used.
4. Control-flow syntax in templates (loops/conditionals) is out of scope for v0.

`templateExpr: safe` remains non-default and MUST be explicitly enabled per feature.

## 2.6 CSS Scope Contract

Default scope mode is `attribute`.

For each compiled feature, the compiler MUST assign a deterministic scope id and rewrite selectors to include a generated attribute selector.

Example:

- Scope attribute: `data-wl-scope="abc123"`
- Author selector: `.btn`
- Output selector: `[data-wl-scope="abc123"] .btn`

`shadow` scope MAY be supported as experimental and MUST be explicitly enabled via `use` block.

`shadow` scope is non-default in v0 and is not required for baseline conformance.

## 2.7 Type Safety Contract (v0)

### HTML

Compiler SHOULD emit diagnostics for:

- unknown element attributes (where schema exists)
- obvious attribute type mismatches
- invalid required attribute absence for known semantic elements (a11y-aware checks)

### CSS

Compiler MUST parse CSS with a standards-compliant parser and emit errors for invalid syntax.

Compiler SHOULD emit diagnostics for:

- invalid property-value pairs
- unknown custom property usage where contract exists

### JS/TS

- `ts` blocks MUST be type checked with TypeScript.
- `js` blocks MAY be type checked via JSDoc or static analysis if configured.

## 2.8 Accessible-by-Default Baseline (v0)

The compiler MUST support first-pass accessibility diagnostics.

Minimum baseline checks:

1. Interactive non-semantic elements without role/keyboard handling.
2. Missing accessible names on form controls and interactive media controls.
3. Invalid or conflicting ARIA attributes for known roles.
4. Obvious heading-order and landmark misuse warnings (best-effort).

Accessibility diagnostics MUST be reported in editor and compile output.

## 2.9 Testing and Asset Contracts (v0 optional)

### Test manifest (optional)

Compiler MAY emit test metadata containing:

- feature name
- mount/adopt mode
- stable test hooks
- lifecycle trace markers

### Asset manifest (optional)

Compiler MAY emit asset metadata containing:

- source path
- output path
- content hash
- media metadata (where available)

## 2.10 Compilation Output Contract

Required output artifacts:

1. ESM JavaScript module
2. CSS file
3. HTML-compatible template representation
4. source maps

Optional output artifacts:

1. type declarations
2. test manifest
3. asset manifest

No proprietary runtime format is required to execute generated output.

## 2.11 Diagnostics Schema (v0)

Diagnostics SHOULD be machine-readable and deterministic.

Minimum fields:

```json
{
	"code": "WL-<domain>-<id>",
	"severity": "error|warning|info",
	"message": "human readable message",
	"file": "path",
	"line": 1,
	"column": 1,
	"hint": "optional fix hint",
	"docs": "optional documentation link"
}
```

Domain examples:

- `GRAMMAR`
- `HTML`
- `CSS`
- `TS`
- `A11Y`
- `RUNTIME`

Example codes:

- `WL-GRAMMAR-001`: Duplicate `html` block in feature.
- `WL-HTML-002`: Unknown attribute for known element.
- `WL-A11Y-004`: Interactive element missing keyboard-operable semantics.

## 3. Risks and Tradeoffs

1. Keeping grammar small limits expressiveness in v0.
2. Safety-focused defaults may feel strict to some users.
3. Accessibility auto-checks can create false positives if not tuned.
4. Deterministic diagnostics require strong parser/type pipeline discipline.

## 4. Worked Examples

## 4.1 Counter Feature

Author input:

```weblang
feature Counter {
  html {
    <button class="btn" type="button" aria-live="polite">
      Count: <span class="n">0</span>
    </button>
  }

  css {
    .btn { font: inherit; padding: .5rem .75rem; }
  }

  ts {
    let n = 0;
    const btn = root.querySelector('.btn')! as HTMLButtonElement;
    const out = root.querySelector('.n')!;

    btn.addEventListener('click', () => {
      n += 1;
      out.textContent = String(n);
    });
  }
}
```

Expected behavior summary:

1. Feature renders a button and count span.
2. CSS is scope-rewritten with generated scope attribute.
3. Click updates text content deterministically.

## 4.2 Adopt Mode Example

Author input:

```weblang
feature Tabs {
  use {
    mode: adopt;
  }

  html {
    <div class="tabs"></div>
  }

  ts {
    // behavior binds to existing server-rendered tab structure
  }
}
```

Expected behavior summary:

1. Runtime binds to existing DOM target.
2. Missing target reports `WL-RUNTIME-ADOPT-001`.
3. Mounted behavior executes without DOM regeneration.

## 5. Open Questions

1. Should `templateExpr: safe` be included in v0 default or remain experimental?
2. Should `shadow` scope ship in v0 or be deferred to v0.1?
3. Which accessibility diagnostics must be compile-native versus plugin-provided?
4. What is the minimum required test-manifest schema for Playwright/Cypress parity?
5. How strict should HTML attribute type checks be by default?

## Appendix A: Conformance Levels (Draft)

- Core: grammar, lifecycle, output contract.
- Safety: type diagnostics and interpolation constraints.
- Accessibility: baseline semantic and ARIA checks.
- Extended: manifests and experimental modes.

## Appendix B: Change Process

Any change to core grammar or lifecycle must include:

1. Decision snapshot.
2. Exact spec delta.
3. Risks/tradeoffs.
4. Worked examples.
5. Open questions.
