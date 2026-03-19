import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { compileProject } from '../compiler/index.mjs'

function validFixture() {
	return `feature ProviderContract {
  html {
    <section class="demo">
      <button type="button">Run</button>
    </section>
  }

  css {
    .demo { display: block; }
  }

  ts {
    root.querySelector('.demo')
  }
}
`
}

test('custom diagnostics provider can inject normalized diagnostics', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'weblang-v3-provider-'))
	const srcDir = path.join(tempRoot, 'src')
	const distDir = path.join(tempRoot, 'dist')

	await mkdir(srcDir, { recursive: true })
	await writeFile(path.join(srcDir, 'provider.weblang'), validFixture(), 'utf8')

	const customProvider = {
		name: 'test-provider',
		validate({ file, makeDiagnostic }) {
			return [
				makeDiagnostic({
					code: 'WL-HTML-901',
					severity: 'warning',
					message: 'provider emitted test diagnostic',
					file,
					index: 0,
				}),
			]
		},
	}

	const result = await compileProject({ srcDir, distDir, providers: [customProvider] })
	assert.equal(result.summary.errors, 0)
	assert.equal(result.summary.warnings, 1)

	const diagnostics = JSON.parse(await readFile(path.join(distDir, 'diagnostics.json'), 'utf8'))
	const diagnostic = diagnostics.find(d => d.code === 'WL-HTML-901')
	assert.ok(diagnostic)
	assert.equal(diagnostic.severity, 'warning')

	await rm(tempRoot, { recursive: true, force: true })
})
