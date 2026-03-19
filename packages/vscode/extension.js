const vscode = require('vscode')

const BLOCK_LANGUAGE_MAP = {
	html: 'html',
	css: 'css',
	props: 'typescript',
	ts: 'typescript',
	js: 'javascript',
}

const BLOCK_EXTENSION_MAP = {
	html: 'html',
	css: 'css',
	typescript: 'ts',
	javascript: 'js',
}

const EMBEDDED_SCHEME = 'weblang-embedded'
let embeddedDocumentId = 0

class EmbeddedContentProvider {
	constructor() {
		this.contentByUri = new Map()
	}

	provideTextDocumentContent(uri) {
		return this.contentByUri.get(uri.toString()) || ''
	}

	setContent(uri, content) {
		this.contentByUri.set(uri.toString(), content)
	}

	deleteContent(uri) {
		this.contentByUri.delete(uri.toString())
	}
}

function createEmbeddedUri(languageId) {
	const extension = BLOCK_EXTENSION_MAP[languageId] || 'txt'
	embeddedDocumentId += 1
	return vscode.Uri.parse(`${EMBEDDED_SCHEME}:/virtual/${embeddedDocumentId}.${extension}`)
}

async function openEmbeddedDocument(content, languageId, provider) {
	const uri = createEmbeddedUri(languageId)
	provider.setContent(uri, content)

	const document = await vscode.workspace.openTextDocument(uri)
	if (document.languageId !== languageId) {
		await vscode.languages.setTextDocumentLanguage(document, languageId)
	}

	return {
		document,
		dispose() {
			provider.deleteContent(uri)
		},
	}
}

function getIndentUnit(options) {
	if (options.insertSpaces) {
		return ' '.repeat(Math.max(1, options.tabSize || 2))
	}
	return '\t'
}

function applyTextEditsToString(text, edits, document) {
	if (!Array.isArray(edits) || edits.length === 0) {
		return text
	}

	const sorted = [...edits].sort((a, b) => {
		const aStart = document.offsetAt(a.range.start)
		const bStart = document.offsetAt(b.range.start)
		if (aStart !== bStart) return bStart - aStart
		const aEnd = document.offsetAt(a.range.end)
		const bEnd = document.offsetAt(b.range.end)
		return bEnd - aEnd
	})

	let output = text
	for (const edit of sorted) {
		const start = document.offsetAt(edit.range.start)
		const end = document.offsetAt(edit.range.end)
		output = output.slice(0, start) + edit.newText + output.slice(end)
	}

	return output
}

async function formatEmbeddedWithProviders(content, languageId, options, provider) {
	try {
		const embedded = await openEmbeddedDocument(content, languageId, provider)
		const tempDoc = embedded.document

		try {
			const edits = await vscode.commands.executeCommand(
				'vscode.executeFormatDocumentProvider',
				tempDoc.uri,
				{
					tabSize: options.tabSize,
					insertSpaces: options.insertSpaces,
				}
			)

			if (!Array.isArray(edits) || edits.length === 0) {
				return content
			}

			return applyTextEditsToString(content, edits, tempDoc)
		} finally {
			embedded.dispose()
		}
	} catch {
		return content
	}
}

function findMatchingBrace(text, openBraceIndex) {
	let depth = 1
	let quote = null
	let escaped = false
	let inLineComment = false
	let inBlockComment = false

	for (let i = openBraceIndex + 1; i < text.length; i += 1) {
		const ch = text[i]
		const next = text[i + 1]

		if (inLineComment) {
			if (ch === '\n') inLineComment = false
			continue
		}

		if (inBlockComment) {
			if (ch === '*' && next === '/') {
				inBlockComment = false
				i += 1
			}
			continue
		}

		if (quote) {
			if (escaped) {
				escaped = false
				continue
			}

			if (ch === '\\') {
				escaped = true
				continue
			}

			if (ch === quote) {
				quote = null
			}
			continue
		}

		if (ch === '/' && next === '/') {
			inLineComment = true
			i += 1
			continue
		}

		if (ch === '/' && next === '*') {
			inBlockComment = true
			i += 1
			continue
		}

		if (ch === "'" || ch === '"' || ch === '`') {
			quote = ch
			continue
		}

		if (ch === '{') {
			depth += 1
			continue
		}

		if (ch === '}') {
			depth -= 1
			if (depth === 0) return i
		}
	}

	return -1
}

function collectFormatBlocks(text) {
	const blocks = []
	const pattern = /(^[ \t]*)(html|css|props|ts|js)\s*\{/gm
	let match

	while ((match = pattern.exec(text)) !== null) {
		const [full, blockIndent, kind] = match
		const openBraceIndex = match.index + full.lastIndexOf('{')
		const closeBraceIndex = findMatchingBrace(text, openBraceIndex)
		if (closeBraceIndex < 0) continue

		const languageId = BLOCK_LANGUAGE_MAP[kind]
		if (!languageId) continue

		blocks.push({
			kind,
			languageId,
			blockIndent,
			contentStart: openBraceIndex + 1,
			contentEnd: closeBraceIndex,
		})
	}

	return blocks
}

function normalizeBlockContent(raw) {
	const lines = raw.replace(/\r\n/g, '\n').split('\n')

	while (lines.length > 0 && lines[0].trim() === '') lines.shift()
	while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop()

	if (lines.length === 0) return ''

	let minIndent = Infinity
	for (const line of lines) {
		if (line.trim() === '') continue
		const indentMatch = line.match(/^[ \t]*/)
		const indentLength = indentMatch ? indentMatch[0].length : 0
		if (indentLength < minIndent) minIndent = indentLength
	}

	if (!Number.isFinite(minIndent)) minIndent = 0

	return lines.map(line => line.slice(minIndent)).join('\n')
}

function findBlockAtOffset(blocks, offset) {
	for (const block of blocks) {
		if (offset >= block.contentStart && offset <= block.contentEnd) {
			return block
		}
	}

	return null
}

function mapVirtualPositionToWeblang(document, block, virtualDocument, virtualPosition) {
	const virtualOffset = virtualDocument.offsetAt(virtualPosition)
	const weblangOffset = block.contentStart + virtualOffset
	return document.positionAt(weblangOffset)
}

function mapVirtualRangeToWeblang(document, block, virtualDocument, virtualRange) {
	return new vscode.Range(
		mapVirtualPositionToWeblang(document, block, virtualDocument, virtualRange.start),
		mapVirtualPositionToWeblang(document, block, virtualDocument, virtualRange.end)
	)
}

function mapCompletionItemToWeblang(document, block, virtualDocument, item) {
	if (item.range instanceof vscode.Range) {
		item.range = mapVirtualRangeToWeblang(document, block, virtualDocument, item.range)
	} else if (
		item.range &&
		item.range.inserting instanceof vscode.Range &&
		item.range.replacing instanceof vscode.Range
	) {
		item.range = {
			inserting: mapVirtualRangeToWeblang(document, block, virtualDocument, item.range.inserting),
			replacing: mapVirtualRangeToWeblang(document, block, virtualDocument, item.range.replacing),
		}
	}

	if (item.textEdit && item.textEdit.range instanceof vscode.Range) {
		item.textEdit = new vscode.TextEdit(
			mapVirtualRangeToWeblang(document, block, virtualDocument, item.textEdit.range),
			item.textEdit.newText
		)
	}

	if (Array.isArray(item.additionalTextEdits)) {
		item.additionalTextEdits = item.additionalTextEdits.map(
			edit =>
				new vscode.TextEdit(
					mapVirtualRangeToWeblang(document, block, virtualDocument, edit.range),
					edit.newText
				)
		)
	}

	return item
}

async function provideEmbeddedCompletions(document, position, context, provider) {
	const offset = document.offsetAt(position)
	const blocks = collectFormatBlocks(document.getText())
	const block = findBlockAtOffset(blocks, offset)
	if (!block) return null

	const content = document.getText().slice(block.contentStart, block.contentEnd)
	const embedded = await openEmbeddedDocument(content, block.languageId, provider)
	const virtualDocument = embedded.document
	const virtualPosition = virtualDocument.positionAt(Math.max(0, offset - block.contentStart))

	try {
		const completionList = await vscode.commands.executeCommand(
			'vscode.executeCompletionItemProvider',
			virtualDocument.uri,
			virtualPosition,
			context?.triggerCharacter
		)

		if (
			!completionList ||
			!Array.isArray(completionList.items) ||
			completionList.items.length === 0
		) {
			return completionList || null
		}

		const remappedItems = completionList.items.map(item =>
			mapCompletionItemToWeblang(document, block, virtualDocument, item)
		)

		return new vscode.CompletionList(remappedItems, completionList.isIncomplete)
	} finally {
		embedded.dispose()
	}
}

function reindentContent(content, blockIndent, indentUnit) {
	if (content.trim() === '') {
		return `\n${blockIndent}`
	}

	const indented = content
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => (line.trim() ? `${blockIndent}${indentUnit}${line}` : ''))
		.join('\n')

	return `\n${indented}\n${blockIndent}`
}

async function formatWeblangDocument(document, options, provider) {
	const text = document.getText()
	const blocks = collectFormatBlocks(text)
	if (blocks.length === 0) return null

	const indentUnit = getIndentUnit(options)
	const replacements = []

	for (const block of blocks) {
		const raw = text.slice(block.contentStart, block.contentEnd)
		const normalized = normalizeBlockContent(raw)
		if (!normalized) continue

		const formatted = await formatEmbeddedWithProviders(
			normalized,
			block.languageId,
			options,
			provider
		)
		const finalContent = reindentContent(formatted.trimEnd(), block.blockIndent, indentUnit)
		if (finalContent === raw) continue

		replacements.push({
			start: block.contentStart,
			end: block.contentEnd,
			text: finalContent,
		})
	}

	if (replacements.length === 0) return null

	let output = text
	replacements
		.sort((a, b) => b.start - a.start)
		.forEach(replacement => {
			output = output.slice(0, replacement.start) + replacement.text + output.slice(replacement.end)
		})

	const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length))
	return [vscode.TextEdit.replace(fullRange, output)]
}

function activate(context) {
	const embeddedProvider = new EmbeddedContentProvider()

	const formattingProvider = {
		provideDocumentFormattingEdits(document, options) {
			return formatWeblangDocument(document, options, embeddedProvider)
		},
	}

	const completionProvider = {
		provideCompletionItems(document, position, token, context) {
			return provideEmbeddedCompletions(document, position, context, embeddedProvider)
		},
	}

	context.subscriptions.push(
		vscode.workspace.registerTextDocumentContentProvider(EMBEDDED_SCHEME, embeddedProvider),
		vscode.languages.registerDocumentFormattingEditProvider('weblang', formattingProvider),
		vscode.languages.registerCompletionItemProvider(
			'weblang',
			completionProvider,
			'<',
			'.',
			':',
			'#',
			'@',
			'$',
			'-',
			'/',
			'"',
			"'"
		)
	)
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
}
