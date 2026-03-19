import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { compileProject } from '../compiler/index.mjs'

function invalidCssFixture() {
	return `feature BrokenCss {
  html {
    <section class="demo">
      <p>Demo</p>
    </section>
  }

  css {
		@media screen and (max-width: 600px {
			.demo {
				color: red;
			}
		}
  }

  ts {
    root.querySelector('.demo')
  }
}
`
}

test('lightningcss emits deterministic css diagnostics for invalid css', async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'weblang-v1-'))
	const srcDir = path.join(tempRoot, 'src')
	const distDir = path.join(tempRoot, 'dist')

	await mkdir(srcDir, { recursive: true })
	await writeFile(path.join(srcDir, 'broken.weblang'), invalidCssFixture(), 'utf8')

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

	const cssDiagnostic = firstDiagnostics.find(d => d.code === 'WL-CSS-001')
	assert.ok(cssDiagnostic)
	assert.equal(cssDiagnostic.severity, 'error')
	assert.match(cssDiagnostic.message, /lightningcss parse/i)

	await rm(tempRoot, { recursive: true, force: true })
})
