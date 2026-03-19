import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')
const distDir = path.join(projectRoot, 'dist')

function stableHash(input) {
	let hash = 2166136261
	for (let i = 0; i < input.length; i += 1) {
		hash ^= input.charCodeAt(i)
		hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
	}
	return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 6)
}

function indexToLineCol(text, index) {
	const slice = text.slice(0, Math.max(0, index))
	const lines = slice.split('\n')
	return {
		line: lines.length,
		column: (lines.at(-1) || '').length + 1,
	}
}

function makeDiagnostic({ code, severity, message, file, index = 0, hint, docs }) {
	const { line, column } = indexToLineCol(file.source, index)
	return {
		code,
		severity,
		message,
		file: file.path,
		line,
		column,
		hint,
		docs,
	}
}

function findMatchingBrace(text, openBraceIndex) {
	let depth = 0
	for (let i = openBraceIndex; i < text.length; i += 1) {
		const ch = text[i]
		if (ch === '{') depth += 1
		if (ch === '}') depth -= 1
		if (depth === 0) return i
	}
	return -1
}

function parseFeature(file, diagnostics) {
	const src = file.source
	const featureMatch = src.match(/feature\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/)
	if (!featureMatch || featureMatch.index === undefined) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-010',
				severity: 'error',
				message: 'Missing feature declaration.',
				file,
				hint: 'Declare one feature per .weblang module: feature Name { ... }',
			})
		)
		return null
	}

	const name = featureMatch[1]
	const openFeatureBrace = src.indexOf('{', featureMatch.index)
	const closeFeatureBrace = findMatchingBrace(src, openFeatureBrace)

	if (closeFeatureBrace < 0) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-011',
				severity: 'error',
				message: `Feature ${name} has an unclosed body.`,
				file,
				index: openFeatureBrace,
			})
		)
		return null
	}

	const body = src.slice(openFeatureBrace + 1, closeFeatureBrace)
	const members = []
	const validMembers = new Set(['props', 'html', 'css', 'js', 'ts', 'use', 'mount', 'unmount'])

	let i = 0
	while (i < body.length) {
		const char = body[i]
		if (/\s/.test(char)) {
			i += 1
			continue
		}

		const match = body.slice(i).match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\{/)
		if (!match || match.index === undefined) {
			i += 1
			continue
		}

		const kind = match[1]
		if (!validMembers.has(kind)) {
			diagnostics.push(
				makeDiagnostic({
					code: 'WL-GRAMMAR-002',
					severity: 'error',
					message: `Unknown feature member: ${kind}`,
					file,
					index: openFeatureBrace + 1 + i,
				})
			)
		}

		const localOpen = body.indexOf('{', i + kind.length)
		const localClose = findMatchingBrace(body, localOpen)
		if (localClose < 0) {
			diagnostics.push(
				makeDiagnostic({
					code: 'WL-GRAMMAR-012',
					severity: 'error',
					message: `Unclosed ${kind} block in feature ${name}.`,
					file,
					index: openFeatureBrace + 1 + i,
				})
			)
			break
		}

		const content = body.slice(localOpen + 1, localClose)
		members.push({
			kind,
			content,
			start: openFeatureBrace + 1 + i,
			end: openFeatureBrace + 1 + localClose,
		})

		i = localClose + 1
	}

	return {
		name,
		members,
		source: src,
	}
}

function parseUseConfig(useContent = '') {
	const modeMatch = useContent.match(/mode\s*:\s*(create|adopt)\s*;/)
	const scopeMatch = useContent.match(/scope\s*:\s*(attribute|shadow)\s*;/)
	const exprMatch = useContent.match(/templateExpr\s*:\s*(off|safe)\s*;/)

	return {
		mode: modeMatch ? modeMatch[1] : 'create',
		scope: scopeMatch ? scopeMatch[1] : 'attribute',
		templateExpr: exprMatch ? exprMatch[1] : 'off',
	}
}

function parseProps(propsContent = '') {
	const props = []
	const propRegex = /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([^=;]+?)(?:=\s*([^;]+))?;/g
	let match
	while ((match = propRegex.exec(propsContent)) !== null) {
		props.push({
			name: match[1],
			type: match[2].trim(),
			defaultExpr: match[3] ? match[3].trim() : undefined,
		})
	}
	return props
}

function rewriteScopedCss(css, scopeId) {
	if (!css.trim()) return ''

	return css.replace(/([^{}@][^{}]*)\{/g, (full, selectorText) => {
		const selectors = selectorText
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)
			.map(s => `[data-wl-scope="${scopeId}"] ${s}`)
			.join(', ')

		if (!selectors) return full
		return `${selectors} {`
	})
}

function addScopeToRootHtml(html, scopeId) {
	return html.replace(/<([A-Za-z][A-Za-z0-9-]*)([^>]*)>/, (full, tag, rest) => {
		if (/data-wl-scope\s*=/.test(rest)) {
			return full
		}
		return `<${tag}${rest} data-wl-scope="${scopeId}">`
	})
}

function compileBehaviorJs(featureName, behaviorSource) {
	return `export function mount(root, props = {}) {\n  const cleanupStack = [];\n  const cleanup = (fn) => {\n    if (typeof fn === 'function') cleanupStack.push(fn);\n  };\n  const emit = (name, detail) => {\n    root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));\n  };\n\n${behaviorSource.trim()}\n\n  return () => {\n    for (let i = cleanupStack.length - 1; i >= 0; i -= 1) {\n      cleanupStack[i]();\n    }\n  };\n}\n\nexport const featureName = ${JSON.stringify(featureName)};\n`
}

function validateFeatureShape(feature, file, diagnostics) {
	const htmlBlocks = feature.members.filter(m => m.kind === 'html')
	const cssBlocks = feature.members.filter(m => m.kind === 'css')
	const tsBlocks = feature.members.filter(m => m.kind === 'ts')
	const jsBlocks = feature.members.filter(m => m.kind === 'js')

	if (htmlBlocks.length !== 1) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-001',
				severity: 'error',
				message: `Feature ${feature.name} must include exactly one html block.`,
				file,
				index: feature.members[0]?.start ?? 0,
			})
		)
	}

	if (cssBlocks.length > 1) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-003',
				severity: 'error',
				message: `Feature ${feature.name} can include at most one css block.`,
				file,
				index: cssBlocks[1]?.start ?? 0,
			})
		)
	}

	if (tsBlocks.length + jsBlocks.length !== 1) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-004',
				severity: 'error',
				message: `Feature ${feature.name} must include exactly one behavior block (ts or js).`,
				file,
				index: feature.members[0]?.start ?? 0,
			})
		)
	}

	const order = feature.members
		.filter(m => ['html', 'css', 'ts', 'js'].includes(m.kind))
		.map(m => m.kind)

	const expected = order.includes('css')
		? ['html', 'css', order.includes('ts') ? 'ts' : 'js']
		: ['html', order.includes('ts') ? 'ts' : 'js']

	if (order.join(',') !== expected.join(',')) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-GRAMMAR-005',
				severity: 'error',
				message: `Feature ${feature.name} must follow default block order: html, css, ts|js.`,
				file,
				index: feature.members[0]?.start ?? 0,
			})
		)
	}
}

function validateHtmlAndA11y(feature, html, file, diagnostics) {
	if (!html.trim().startsWith('<')) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-HTML-001',
				severity: 'error',
				message: `Feature ${feature.name} html block is not valid html-like content.`,
				file,
			})
		)
		return
	}

	const buttonWithHref = /<button\b[^>]*\bhref\s*=/.test(html)
	if (buttonWithHref) {
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-HTML-002',
				severity: 'error',
				message: 'button does not support href attribute.',
				file,
				hint: 'Use <a href="..."> or remove href from button.',
			})
		)
	}

	const tabCandidates = [...html.matchAll(/<([A-Za-z][A-Za-z0-9-]*)\b([^>]*)>/g)]
	for (const match of tabCandidates) {
		const tag = match[1].toLowerCase()
		const attrs = match[2]
		const attrOffset = match.index ?? 0

		if (tag === 'button') {
			const typeValueMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/)
			if (typeValueMatch) {
				const rawType = typeValueMatch[1].trim().toLowerCase()
				const allowed = new Set(['button', 'submit', 'reset'])
				if (!allowed.has(rawType)) {
					diagnostics.push(
						makeDiagnostic({
							code: 'WL-HTML-003',
							severity: 'error',
							message: `button type must be one of: button, submit, reset. Received: ${rawType}`,
							file,
							index: attrOffset,
							hint: 'Use a valid button type value for deterministic behavior.',
						})
					)
				}
			}
		}

		if (tag === 'button' && !/\btype\s*=/.test(attrs)) {
			diagnostics.push(
				makeDiagnostic({
					code: 'WL-A11Y-001',
					severity: 'warning',
					message: 'button should declare an explicit type attribute.',
					file,
				})
			)
		}

		if (/\brole\s*=\s*"tab"/.test(attrs) && !/\baria-selected\s*=/.test(attrs)) {
			diagnostics.push(
				makeDiagnostic({
					code: 'WL-A11Y-004',
					severity: 'error',
					message: 'role="tab" requires aria-selected for baseline conformance.',
					file,
					hint: 'Set aria-selected="true" or "false" on each tab control.',
				})
			)
		}

		if (/\brole\s*=\s*"button"/.test(attrs) && !/\btabindex\s*=/.test(attrs)) {
			diagnostics.push(
				makeDiagnostic({
					code: 'WL-A11Y-006',
					severity: 'warning',
					message: 'role="button" should include keyboard focus semantics (tabindex).',
					file,
				})
			)
		}
	}
}

function validateCss(feature, css, file, diagnostics) {
	if (!css.trim()) return

	try {
		transform({
			filename: file.path,
			code: Buffer.from(css),
			minify: false,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Invalid css syntax.'
		diagnostics.push(
			makeDiagnostic({
				code: 'WL-CSS-001',
				severity: 'error',
				message: `Feature ${feature.name} css block failed lightningcss parse: ${message}`,
				file,
				hint: 'Fix invalid declaration syntax before compiling.',
			})
		)
	}
}

function featureFromMembers(feature) {
	const byKind = new Map()
	for (const member of feature.members) {
		byKind.set(member.kind, member)
	}

	const html = byKind.get('html')?.content ?? ''
	const css = byKind.get('css')?.content ?? ''
	const behavior = byKind.get('ts')?.content ?? byKind.get('js')?.content ?? ''
	const useConfig = parseUseConfig(byKind.get('use')?.content ?? '')
	const props = parseProps(byKind.get('props')?.content ?? '')

	const scopeId = stableHash(feature.name)

	return {
		name: feature.name,
		html,
		css,
		behavior,
		useConfig,
		props,
		scopeId,
	}
}

async function compileFile(filePath) {
	const source = await readFile(filePath, 'utf8')
	const file = { path: filePath, source }
	const diagnostics = []
	const parsed = parseFeature(file, diagnostics)

	if (!parsed) {
		return {
			filePath,
			diagnostics,
			artifacts: null,
			feature: null,
		}
	}

	validateFeatureShape(parsed, file, diagnostics)

	const model = featureFromMembers(parsed)

	validateHtmlAndA11y(parsed, model.html, file, diagnostics)
	validateCss(parsed, model.css, file, diagnostics)

	const hasErrors = diagnostics.some(d => d.severity === 'error')
	if (hasErrors) {
		return {
			filePath,
			diagnostics,
			artifacts: null,
			feature: model,
		}
	}

	const scopedHtml = addScopeToRootHtml(model.html.trim(), model.scopeId)
	const scopedCss = rewriteScopedCss(model.css.trim(), model.scopeId)
	const js = compileBehaviorJs(model.name, model.behavior)

	return {
		filePath,
		diagnostics,
		artifacts: {
			html: scopedHtml,
			css: scopedCss,
			js,
			metadata: {
				feature: model.name,
				source: filePath,
				scopeId: model.scopeId,
				mode: model.useConfig.mode,
				scope: model.useConfig.scope,
				templateExpr: model.useConfig.templateExpr,
				props: model.props,
			},
		},
		feature: model,
	}
}

export async function compileProject(options = {}) {
	const localSrcDir = options.srcDir ?? srcDir
	const localDistDir = options.distDir ?? distDir

	await mkdir(localDistDir, { recursive: true })
	await rm(localDistDir, { recursive: true, force: true })
	await mkdir(localDistDir, { recursive: true })

	const files = (await readdir(localSrcDir))
		.filter(name => name.endsWith('.weblang'))
		.sort()
		.map(name => path.join(localSrcDir, name))

	const outputs = []
	const diagnostics = []

	for (const filePath of files) {
		const compiled = await compileFile(filePath)
		diagnostics.push(...compiled.diagnostics)
		outputs.push(compiled)

		if (!compiled.artifacts) continue

		const base = compiled.feature.name.toLowerCase()
		await writeFile(path.join(localDistDir, `${base}.html`), `${compiled.artifacts.html}\n`, 'utf8')
		await writeFile(path.join(localDistDir, `${base}.css`), `${compiled.artifacts.css}\n`, 'utf8')
		await writeFile(path.join(localDistDir, `${base}.js`), compiled.artifacts.js, 'utf8')
		await writeFile(
			path.join(localDistDir, `${base}.meta.json`),
			`${JSON.stringify(compiled.artifacts.metadata, null, 2)}\n`,
			'utf8'
		)
	}

	await writeFile(
		path.join(localDistDir, 'diagnostics.json'),
		`${JSON.stringify(diagnostics, null, 2)}\n`,
		'utf8'
	)

	const summary = {
		files: files.length,
		features: outputs.filter(o => o.feature).length,
		emitted: outputs.filter(o => o.artifacts).length,
		errors: diagnostics.filter(d => d.severity === 'error').length,
		warnings: diagnostics.filter(d => d.severity === 'warning').length,
	}

	await writeFile(
		path.join(localDistDir, 'summary.json'),
		`${JSON.stringify(summary, null, 2)}\n`,
		'utf8'
	)

	return {
		outputs,
		diagnostics,
		summary,
		paths: { srcDir: localSrcDir, distDir: localDistDir },
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const result = await compileProject()
	console.log(JSON.stringify(result.summary, null, 2))
	if (result.summary.errors > 0) {
		process.exitCode = 1
	}
}
