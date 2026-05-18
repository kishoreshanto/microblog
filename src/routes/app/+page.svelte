<script lang="ts">
	import { enhance } from '$app/forms';
	import PostEditor from '$lib/components/posts/PostEditor.svelte';
	import { countWords } from '$lib/utils/words';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	let content = $derived(form?.content ?? '');
	let wordCount = $derived(countWords(content));
	let isOverLimit = $derived(wordCount > 100);
</script>

<svelte:head>
	<title>MicroBlog | App</title>
</svelte:head>

<section class="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
	<header class="space-y-2">
		<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Private feed</p>
		<h1 class="text-3xl font-bold tracking-tight text-slate-950">Your MicroBlog</h1>
		<p class="text-slate-600">Write short private posts. Each post is limited to 100 words.</p>
	</header>

	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			return async ({ result, update }) => {
				await update({ reset: false });

				if (result.type === 'success') {
					content = '';
				}
			};
		}}
		class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
	>
		<div class="space-y-2">
			<label for="content" class="block text-sm font-medium text-slate-900">
				New private post
			</label>

			<PostEditor name="content" bind:content maxWords={100} />
		</div>

		<div class="flex justify-end">
			<button
				type="submit"
				disabled={isOverLimit || wordCount === 0}
				class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
			>
				Post privately
			</button>
		</div>

		{#if form?.error}
			<p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
				{form.error}
			</p>
		{/if}

		{#if form?.success}
			<p class="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">Post saved.</p>
		{/if}
	</form>

	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold text-slate-950">Your posts</h2>
			<p class="text-sm text-slate-500">{data.posts.length} total</p>
		</div>

		{#if data.loaderror}
			<p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
				{data.loaderror}
			</p>
		{/if}

		{#if data.posts.length === 0}
			<div class="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
				<p class="font-medium text-slate-900">No posts yet.</p>
				<p class="mt-1 text-sm text-slate-500">Write your first private post above.</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.posts as post (post.id)}
					<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<p class="whitespace-pre-wrap text-slate-900">{post.content}</p>

						<footer class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
							<span>{post.word_count} words</span>
							<span>Private</span>
							<time datetime={post.created_at}>
								{new Date(post.created_at).toLocaleString()}
							</time>
						</footer>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>
