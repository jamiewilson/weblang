# Weblang VS Code Extension

This package provides basic language support for `.weblang` files:

- File association for Weblang
- A custom Weblang file icon inspired by HTML, CSS, and JS colors
- TextMate grammar-based syntax highlighting
- Embedded highlighting for `html`, `css`, `ts`, and `js` blocks
- Weblang document formatting that delegates `html`, `css`, `ts`, and `js` block content to installed VS Code formatters

## Development

Open this folder in VS Code and run extension host:

1. Install dependencies if needed for packaging: `pnpm add -g @vscode/vsce`
2. Press `F5` in VS Code to launch an Extension Development Host
3. Open any `.weblang` file to verify highlighting

## Package

From this directory:

- `pnpm run check` to validate JSON files
- `vsce package` to build a `.vsix`

## Notes

This is intentionally a minimal first version. It does not include:

- A language server
- Diagnostics
- Snippets

Those can be added incrementally after syntax grammar stabilizes.

## Oxc Formatter Setup

To use Oxc (`oxfmt`) for embedded block formatting, set Oxc as default formatter for relevant languages in your user or workspace settings:

```json
{
	"[javascript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
	"[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
	"[css]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
	"[html]": { "editor.defaultFormatter": "oxc.oxc-vscode" }
}
```

When you run Format Document on a `.weblang` file, the extension formats each embedded block through VS Code's formatter pipeline.

## File Icon Notes

The extension contributes a language icon for `.weblang`.

- If your active file icon theme supports language icons, you should see the Weblang icon in Explorer.
- Some icon themes may override unknown extensions with their own generic icon.
