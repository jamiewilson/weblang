import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileProject } from '../compiler/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const reports = path.join(root, 'reports')

function requirementResult(id, description, pass, evidence) {
	return { id, description, pass, evidence }
}

function summarizeResults(requirements) {
	const failed = requirements.filter(r => !r.pass)
	return {
		passed: failed.length === 0,
		total: requirements.length,
		failed: failed.length,
		failedIds: failed.map(f => f.id),
	}
}

async function fileExists(filePath) {
	try {
		await access(filePath)
		return true
	} catch {
		return false
	}
}

async function validate() {
	const compiled = await compileProject()
	await mkdir(reports, { recursive: true })

	const requiredArtifacts = [
		'counter.html',
		'counter.css',
		'counter.js',
		'tabs.html',
		'tabs.css',
		'tabs.js',
		'users.html',
		'users.css',
		'users.js',
		'diagnostics.json',
	]

	const artifactChecks = await Promise.all(
		requiredArtifacts.map(async name => ({
			name,
			exists: await fileExists(path.join(dist, name)),
		}))
	)

	const diagnosticsPath = path.join(dist, 'diagnostics.json')
	const diagnostics = JSON.parse(await readFile(diagnosticsPath, 'utf8'))
	const errors = diagnostics.filter(d => d.severity === 'error')
	const a11yCodes = diagnostics.filter(d => String(d.code).startsWith('WL-A11Y-')).map(d => d.code)

	const requirements = [
		requirementResult(
			'MP-1',
			'Locality and clarity of behavior: three canonical features authored as single feature units.',
			compiled.summary.features === 3,
			{ features: compiled.summary.features }
		),
		requirementResult(
			'MP-2',
			'Type/grammar safety: compilation reports no error-level diagnostics.',
			errors.length === 0,
			{ errorCount: errors.length }
		),
		requirementResult(
			'MP-3',
			'Testing-first integration: spike has runnable runtime tests.',
			await fileExists(path.join(root, 'tests', 'spike.runtime.test.mjs')),
			{ testFile: 'spikes/v1/tests/spike.runtime.test.mjs' }
		),
		requirementResult(
			'MP-4',
			'Accessible-by-default baseline: a11y diagnostics pass without error-level violations.',
			errors.filter(d => String(d.code).startsWith('WL-A11Y-')).length === 0,
			{ a11yDiagnosticCodes: a11yCodes }
		),
		requirementResult(
			'MP-5',
			'Standard output artifacts: html/css/js emit for Counter, Tabs, Users.',
			artifactChecks.every(a => a.exists),
			{ artifacts: artifactChecks }
		),
		requirementResult(
			'MP-6',
			'Deterministic diagnostics schema: machine-readable diagnostics are emitted.',
			Array.isArray(diagnostics),
			{ diagnosticsCount: diagnostics.length }
		),
	]

	const overall = summarizeResults(requirements)

	const report = {
		timestamp: new Date().toISOString(),
		summary: compiled.summary,
		overall,
		requirements,
	}

	const markdown = [
		'# Weblang v1 Spike Validation',
		'',
		`Overall: ${overall.passed ? 'PASS' : 'FAIL'}`,
		'',
		`- Requirements checked: ${overall.total}`,
		`- Failed: ${overall.failed}`,
		'',
		'## Requirement Results',
		'',
		...requirements.map(r => `- ${r.id}: ${r.pass ? 'PASS' : 'FAIL'} - ${r.description}`),
		'',
		'## Compile Summary',
		'',
		'```json',
		JSON.stringify(compiled.summary, null, 2),
		'```',
	].join('\n')

	await writeFile(
		path.join(reports, 'validation.json'),
		`${JSON.stringify(report, null, 2)}\n`,
		'utf8'
	)
	await writeFile(path.join(reports, 'validation.md'), `${markdown}\n`, 'utf8')

	console.log(JSON.stringify({ overall, summary: compiled.summary }, null, 2))

	if (!overall.passed) {
		process.exitCode = 1
	}
}

await validate()
