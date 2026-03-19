import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { JSDOM } from 'jsdom'
import { compileProject } from '../compiler/index.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '..', 'dist')

async function loadFeature(feature) {
	const html = await readFile(path.join(distDir, `${feature}.html`), 'utf8')
	const moduleUrl = pathToFileURL(path.join(distDir, `${feature}.js`)).href
	const mod = await import(moduleUrl)

	const dom = new JSDOM(`<div id="app">${html}</div>`, {
		pretendToBeVisual: true,
		url: 'https://example.test/',
	})

	global.window = dom.window
	global.document = dom.window.document
	global.CustomEvent = dom.window.CustomEvent
	global.Element = dom.window.Element
	global.HTMLElement = dom.window.HTMLElement
	global.AbortController = dom.window.AbortController

	const root = dom.window.document.querySelector('#app').firstElementChild
	return { dom, mount: mod.mount, root }
}

test('compile project before runtime checks', async () => {
	const result = await compileProject()
	assert.equal(result.summary.errors, 0)
	assert.equal(result.summary.emitted, 3)
})

test('counter increments and emits', async () => {
	const { root, mount } = await loadFeature('counter')
	const events = []
	root.addEventListener('counter:changed', event => events.push(event.detail))

	const dispose = mount(root, {})
	const btn = root.querySelector('.btn')
	btn.click()
	btn.click()

	assert.equal(root.querySelector('.n').textContent, '2')
	assert.deepEqual(events.at(-1), { value: 2 })
	dispose()
})

test('tabs click switches selected tab and panel', async () => {
	const { root, mount } = await loadFeature('tabs')
	mount(root, {})

	const second = root.querySelector('[data-tab="b"]')
	second.click()

	assert.equal(root.querySelector('[data-tab="a"]').getAttribute('aria-selected'), 'false')
	assert.equal(root.querySelector('[data-tab="b"]').getAttribute('aria-selected'), 'true')
	assert.equal(root.querySelector('[data-panel="a"]').hidden, true)
	assert.equal(root.querySelector('[data-panel="b"]').hidden, false)
})

test('users loads list and updates status', async () => {
	const { root, mount } = await loadFeature('users')

	global.fetch = async () => ({
		ok: true,
		async json() {
			return [{ name: 'Ada' }, { name: 'Lin' }]
		},
	})

	mount(root, { endpoint: '/fake' })

	await new Promise(resolve => setTimeout(resolve, 0))
	await new Promise(resolve => setTimeout(resolve, 0))

	assert.equal(root.querySelectorAll('.list li').length, 2)
	assert.match(root.querySelector('.status').textContent, /Loaded 2 users/)
})
