import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { compileProject } from '../compiler/index.mjs'

function invalidButtonTypeFixture() {
	return `feature InvalidButtonType {
  html {
    <section>
      <button type="primary">Save</button>
    </section>
  }

  css {
    section { display: block; }
  }

  ts {
    root.querySelector('button')
  }
}
`
}

test('html diagnostics are deterministic for invalid button type values', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'weblang-v2-'))
	const srcDir = path.join(tempRoot, 'src')
	const distDir = path.join(tempRoot, 'dist')

	await mkdir(srcDir, { recursive: true })
	await writeFile(path.join(srcDir, 'broken.weblang'), invalidButtonTypeFixture(), 'utf8')

	const first = await compileProject({ srcDir, distDir })
	const firstDiagnostics = JSON.parse(
		await readFile(path.join(distDir, 'diagnostics.json'), 'utf8')
	)

	const second = await compileProject({ srcDir, distDir })
	const secondDiagnostics = JSON.parse(
		await readFile(path.join(distDir, 'diagnostics.json'), 'utf8')
	)

	assert.equal(first.summary.errors, 1)
	assert.equal(second.summary.errors, 1)
	assert.deepEqual(firstDiagnostics, secondDiagnostics)

	const htmlDiagnostic = firstDiagnostics.find(d => d.code === 'WL-HTML-003')
	assert.ok(htmlDiagnostic)
	assert.equal(htmlDiagnostic.severity, 'error')
	assert.match(htmlDiagnostic.message, /button type must be one of/i)

	await rm(tempRoot, { recursive: true, force: true })
})
