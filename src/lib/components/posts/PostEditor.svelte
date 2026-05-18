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
	let wordCount = $state(0);

	let remainingWords = $derived(maxWords - wordCount);
	let isEmpty = $derived(wordCount === 0);
	let isOverLimit = $derived(wordCount > maxWords);

	function syncFromEditor(editor: Editor) {
		content = editor.getText().trim();
		wordCount = editor.storage.characterCount.words();
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
				StarterKit.configure({
					heading: false,
					blockquote: false,
					codeBlock: false,
					horizontalRule: false,
					bulletList: false,
					orderedList: false
				}),
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
				editorState = { editor };
				syncFromEditor(editor);
			},
			onTransaction: ({ editor }) => {
				editorState = { editor };
				syncFromEditor(editor);
			}
		});

		editorState = { editor };

		return () => {
			editor.destroy();
			editorState = { editor: null };
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
	:global(.tiptap p.is-editor-empty:first-child::before) {
		color: #94a3b8;
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}
</style>
