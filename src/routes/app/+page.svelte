<script lang="ts">
	import { enhance } from '$app/forms';
	import PostEditor from '$lib/components/posts/PostEditor.svelte';
	import { countWords } from '$lib/utils/words';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	type Post = PageData['posts'][number];

	// svelte-ignore state_referenced_locally
	// Seed editable state from server form data once; subsequent updates come from editor binding.
	let content = $state(form?.action === 'create' ? (form.content ?? '') : '');
	let wordCount = $derived(countWords(content));
	let isOverLimit = $derived(wordCount > 100);
	let isFormatted = $state(false);
	let isCreating = $state(false);
	let deletingPostID = $state<string | null>(null);
	let updatingPostID = $state<string | null>(null);
	// svelte-ignore state_referenced_locally
	let editingPostID = $state<string | null>(
		form?.action === 'update' ? (form.postID ?? null) : null
	);
	// svelte-ignore state_referenced_locally
	let editContent = $state(form?.action === 'update' ? (form.content ?? '') : '');
	let editWordCount = $derived(countWords(editContent));
	let isEditOverLimit = $derived(editWordCount > 100);
	let postCountLabel = $derived(
		data.posts.length === 1 ? '1 private post' : `${data.posts.length} private posts`
	);

	function formatPostDate(value: string) {
		const date = new Date(value);
		const now = new Date();
		const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
		const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		const dayDiff = Math.round((nowStart - dateStart) / 86_400_000);
		const time = new Intl.DateTimeFormat(undefined, {
			hour: 'numeric',
			minute: '2-digit'
		}).format(date);

		if (dayDiff === 0) return `Today at ${time}`;
		if (dayDiff === 1) return `Yesterday at ${time}`;

		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(date);
	}

	function wasEdited(post: Post) {
		return (
			Math.abs(new Date(post.updated_at).getTime() - new Date(post.created_at).getTime()) > 1000
		);
	}

	function startEditing(post: Post) {
		editingPostID = post.id;
		editContent = post.content;
	}

	function stopEditing() {
		editingPostID = null;
		editContent = '';
		updatingPostID = null;
	}
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
			isCreating = true;

			return async ({ result, update }) => {
				await update({ reset: false });
				isCreating = false;

				if (result.type === 'success') {
					content = '';
				}
			};
		}}
		class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
	>
		<div class="space-y-3">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<label for="content" class="block text-sm font-medium text-slate-900">
					New private post
				</label>
			</div>

			<PostEditor
				name="content"
				bind:content
				maxWords={100}
				mode={isFormatted ? 'formatted' : 'plain'}
			/>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="min-h-9">
				{#if form?.action === 'create' && form.error}
					<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
						{form.error}
					</p>
				{:else if form?.action === 'create' && form.success}
					<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
						Post saved privately.
					</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={isCreating || isOverLimit || wordCount === 0}
				class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
			>
				{isCreating ? 'Saving...' : 'Post privately'}
			</button>
		</div>
	</form>

	<section class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<div>
				<h2 class="text-xl font-semibold text-slate-950">Your posts</h2>
				<p class="mt-1 text-sm text-slate-500">{postCountLabel}</p>
			</div>

			{#if form?.action === 'delete' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post deleted.</p>
			{:else if form?.action === 'update' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post updated.</p>
			{:else if (form?.action === 'delete' || form?.action === 'update') && form.error}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
			{/if}
		</div>

		{#if data.loaderror}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
				{data.loaderror}
			</p>
		{/if}

		{#if data.posts.length === 0}
			<div
				class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
			>
				<p class="text-lg font-semibold text-slate-950">No private posts yet</p>
				<p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
					Write your first MicroBlog above. It will stay visible only to you.
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.posts as post (post.id)}
					<article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						{#if editingPostID === post.id}
							<form
								method="POST"
								action="?/update"
								use:enhance={() => {
									updatingPostID = post.id;

									return async ({ result, update }) => {
										await update({ reset: false });
										updatingPostID = null;

										if (result.type === 'success') {
											stopEditing();
										}
									};
								}}
								class="space-y-4"
							>
								<input type="hidden" name="postID" value={post.id} />

								<PostEditor name="content" bind:content={editContent} maxWords={100} mode="plain" />

								<div class="flex flex-wrap items-center justify-between gap-3">
									{#if form?.action === 'update' && form.postID === post.id && form.error}
										<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
											{form.error}
										</p>
									{:else}
										<p class="text-sm text-slate-500">
											Editing a private post from {formatPostDate(post.created_at)}.
										</p>
									{/if}

									<div class="flex items-center gap-2">
										<button
											type="button"
											disabled={updatingPostID === post.id}
											class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
											onclick={stopEditing}
										>
											Cancel
										</button>

										<button
											type="submit"
											disabled={updatingPostID === post.id ||
												isEditOverLimit ||
												editWordCount === 0}
											class="rounded-lg border border-slate-300 bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
										>
											{updatingPostID === post.id ? 'Saving...' : 'Save changes'}
										</button>
									</div>
								</div>
							</form>
						{:else}
							<div class="space-y-4">
								<p class="leading-7 wrap-break-word whitespace-pre-wrap text-slate-900">
									{post.content}
								</p>

								<footer
									class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"
								>
									<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
										<span>{post.word_count} {post.word_count === 1 ? 'word' : 'words'}</span>
										<span aria-hidden="true">/</span>
										<span
											class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
										>
											Private
										</span>
										<span aria-hidden="true">/</span>
										<time datetime={post.created_at}>{formatPostDate(post.created_at)}</time>
										{#if wasEdited(post)}
											<span aria-hidden="true">/</span>
											<span>Edited {formatPostDate(post.updated_at)}</span>
										{/if}
									</div>

									<div class="flex items-center gap-2">
										<button
											type="button"
											disabled={deletingPostID === post.id}
											class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
											onclick={() => startEditing(post)}
										>
											Edit
										</button>

										<form
											method="POST"
											action="?/delete"
											onsubmit={(event) => {
												if (!confirm('Delete this post? This cannot be undone.')) {
													event.preventDefault();
												}
											}}
											use:enhance={() => {
												deletingPostID = post.id;

												return async ({ update }) => {
													await update();
													deletingPostID = null;
												};
											}}
										>
											<input type="hidden" name="postID" value={post.id} />

											<button
												type="submit"
												disabled={deletingPostID === post.id}
												class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
												aria-label="Delete post"
											>
												{deletingPostID === post.id ? 'Deleting...' : 'Delete'}
											</button>
										</form>
									</div>
								</footer>
							</div>
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>
