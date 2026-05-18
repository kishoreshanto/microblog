<script lang="ts">
	import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';

	import { StarterKit } from '@tiptap/starter-kit';
	import { CharacterCount, Placeholder } from '@tiptap/extensions';

	type Props = {
		name?: string;
		content?: string;
		maxWords?: number;
	};

	let { name = 'content', content = $bindable(''), maxWords = 100 }: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let editorState = $state<{ editor: Editor | null }>({ editor: null });
	let editorVersion = $state(0);
	let wordCount = $state(0);

	let remainingWords = $derived(maxWords - wordCount);
	let isEmpty = $derived(wordCount === 0);
	let isOverLimit = $derived(wordCount > maxWords);

	function refreshToolbar(editor: Editor) {
		editorState = { editor };
		editorVersion += 1;
	}

	function syncFromEditor(editor: Editor) {
		content = editor.getText().trim();
		wordCount = editor.storage.characterCount.words();
	}

	function runCommand(command: (editor: Editor) => void) {
		const editor = editorState.editor;

		if (!editor) return;

		command(editor);
		refreshToolbar(editor);
	}

	function canRun(command: (editor: Editor) => boolean) {
		editorVersion;

		const editor = editorState.editor;

		return editor ? command(editor) : false;
	}

	function isActive(name: string, attrs?: Record<string, unknown>) {
		editorVersion;

		return editorState.editor?.isActive(name, attrs) ?? false;
	}

	function toEditorHtml(value: string) {
		const escaped = value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/\n/g, '<br>');

		return escaped ? `<p>${escaped}</p>` : '';
	}

	onMount(() => {
		if (!element) return;

		const editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Placeholder.configure({
					placeholder: `Write up to ${maxWords} words...`
				}),
				CharacterCount.configure({
					wordCounter: (text) => text.split(/\s+/).filter((word) => word !== '').length
				})
			],
			content: toEditorHtml(content),
			editorProps: {
				attributes: {
					class:
						'min-h-36 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 shadow-sm outline-none focus:border-slate-900'
				}
			},
			onCreate: ({ editor }) => {
				refreshToolbar(editor);
				syncFromEditor(editor);
			},
			onSelectionUpdate: ({ editor }) => {
				refreshToolbar(editor);
			},
			onTransaction: ({ editor }) => {
				refreshToolbar(editor);
				syncFromEditor(editor);
			}
		});

		refreshToolbar(editor);

		return () => {
			editor.destroy();
			editorState = { editor: null };
			editorVersion += 1;
		};
	});

	$effect(() => {
		const editor = editorState.editor;

		if (!editor) return;

		if (content.trim() !== editor.getText().trim()) {
			editor.commands.setContent(toEditorHtml(content.trim()));
			syncFromEditor(editor);
		}
	});
</script>

<div class="space-y-2">
	<input type="hidden" {name} value={content} />

	{#if editorState.editor}
		<div
			class="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
		>
			<button
				type="button"
				title="Bold"
				aria-label="Bold"
				disabled={!canRun((editor) => editor.can().chain().focus().toggleBold().run())}
				class:active-toolbar-button={isActive('bold')}
				class="toolbar-button font-bold"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleBold().run())}
			>
				<span class="font-black">
					B
				</span>
			</button>

			<button
				type="button"
				title="Italic"
				aria-label="Italic"
				disabled={!canRun((editor) => editor.can().chain().focus().toggleItalic().run())}
				class:active-toolbar-button={isActive('italic')}
				class="toolbar-button italic"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleItalic().run())}
			>
				<span class="italic">
					I
				</span>
			</button>

			<button
				type="button"
				title="Strike"
				aria-label="Strike"
				disabled={!canRun((editor) => editor.can().chain().focus().toggleStrike().run())}
				class:active-toolbar-button={isActive('strike')}
				class="toolbar-button line-through"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleStrike().run())}
			>
				<span class="line-through">
					S
				</span>
			</button>

			<button
				type="button"
				title="Inline code"
				aria-label="Inline code"
				disabled={!canRun((editor) => editor.can().chain().focus().toggleCode().run())}
				class:active-toolbar-button={isActive('code')}
				class="toolbar-button font-mono"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleCode().run())}
			>
				<span class="font-mono">
					&lt;/&gt;
				</span>
			</button>

			<span class="mx-1 h-6 w-px bg-slate-200" aria-hidden="true"></span>

			<button
				type="button"
				title="Paragraph"
				aria-label="Paragraph"
				class:active-toolbar-button={isActive('paragraph')}
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().setParagraph().run())}
			>
				P
			</button>

			<button
				type="button"
				title="Heading 1"
				aria-label="Heading 1"
				class:active-toolbar-button={isActive('heading', { level: 1 })}
				class="toolbar-button"
				onclick={() =>
					runCommand((editor) => editor.chain().focus().toggleHeading({ level: 1 }).run())}
			>
				H1
			</button>

			<button
				type="button"
				title="Heading 2"
				aria-label="Heading 2"
				class:active-toolbar-button={isActive('heading', { level: 2 })}
				class="toolbar-button"
				onclick={() =>
					runCommand((editor) => editor.chain().focus().toggleHeading({ level: 2 }).run())}
			>
				H2
			</button>

			<button
				type="button"
				title="Heading 3"
				aria-label="Heading 3"
				class:active-toolbar-button={isActive('heading', { level: 3 })}
				class="toolbar-button"
				onclick={() =>
					runCommand((editor) => editor.chain().focus().toggleHeading({ level: 3 }).run())}
			>
				H3
			</button>

			<span class="mx-1 h-6 w-px bg-slate-200" aria-hidden="true"></span>

			<button
				type="button"
				title="Bullet list"
				aria-label="Bullet list"
				class:active-toolbar-button={isActive('bulletList')}
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleBulletList().run())}
			>
				&bull;
			</button>

			<button
				type="button"
				title="Numbered list"
				aria-label="Numbered list"
				class:active-toolbar-button={isActive('orderedList')}
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleOrderedList().run())}
			>
				1.
			</button>

			<button
				type="button"
				title="Blockquote"
				aria-label="Blockquote"
				class:active-toolbar-button={isActive('blockquote')}
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleBlockquote().run())}
			>
				&quot;
			</button>

			<button
				type="button"
				title="Code block"
				aria-label="Code block"
				class:active-toolbar-button={isActive('codeBlock')}
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().toggleCodeBlock().run())}
			>
				&#123;&#125;
			</button>

			<span class="mx-1 h-6 w-px bg-slate-200" aria-hidden="true"></span>

			<button
				type="button"
				title="Horizontal rule"
				aria-label="Horizontal rule"
				class="toolbar-button"
				onclick={() => runCommand((editor) => editor.chain().focus().setHorizontalRule().run())}
			>
				&mdash;
			</button>
		</div>
	{/if}

	<div bind:this={element}></div>

	<div class="flex items-center justify-between gap-4">
		<p class:text-red-600={isOverLimit} class="text-sm text-slate-500">
			{wordCount} / {maxWords} words

			{#if remainingWords >= 0}
				<span>({remainingWords} remaining)</span>
			{:else}
				<span>({Math.abs(remainingWords)} over)</span>
			{/if}
		</p>

		{#if isEmpty}
			<p class="text-sm text-slate-500">Post cannot be empty.</p>
		{:else if isOverLimit}
			<p class="text-sm text-red-600">Post is too long.</p>
		{/if}
	</div>
</div>

<style>
	.toolbar-button {
		display: inline-flex;
		min-width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		padding: 0 0.5rem;
		color: #334155;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1;
	}

	.toolbar-button:hover:not(:disabled) {
		border-color: #cbd5e1;
		background: #ffffff;
		color: #0f172a;
	}

	.toolbar-button:disabled {
		cursor: not-allowed;
		color: #94a3b8;
	}

	.active-toolbar-button {
		border-color: #0f172a;
		background: #0f172a;
		color: #ffffff;
	}

	:global(.tiptap) {
		line-height: 1.65;
	}

	:global(.tiptap > * + *) {
		margin-top: 0.75rem;
	}

	:global(.tiptap h1),
	:global(.tiptap h2),
	:global(.tiptap h3) {
		font-weight: 700;
		line-height: 1.2;
	}

	:global(.tiptap h1) {
		font-size: 1.875rem;
	}

	:global(.tiptap h2) {
		font-size: 1.5rem;
	}

	:global(.tiptap h3) {
		font-size: 1.25rem;
	}

	:global(.tiptap blockquote) {
		border-left: 4px solid #cbd5e1;
		color: #475569;
		font-style: italic;
		margin-left: 0;
		padding-left: 1rem;
	}

	:global(.tiptap ul),
	:global(.tiptap ol) {
		padding-left: 1.5rem;
	}

	:global(.tiptap ul) {
		list-style: disc;
	}

	:global(.tiptap ol) {
		list-style: decimal;
	}

	:global(.tiptap code) {
		border-radius: 0.25rem;
		background: #f1f5f9;
		color: #0f172a;
		font-size: 0.875em;
		padding: 0.125rem 0.25rem;
	}

	:global(.tiptap pre) {
		overflow-x: auto;
		border-radius: 0.75rem;
		background: #0f172a;
		color: #f8fafc;
		padding: 0.875rem 1rem;
	}

	:global(.tiptap pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
	}

	:global(.tiptap p.is-editor-empty:first-child::before) {
		color: #94a3b8;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
