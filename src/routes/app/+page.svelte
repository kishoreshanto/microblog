<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import CommentSection from '$lib/components/posts/CommentSection.svelte';
	import PostEditor from '$lib/components/posts/PostEditor.svelte';
	import VoteButtons from '$lib/components/posts/VoteButtons.svelte';
	import { countWords } from '$lib/utils/words';
	import { fade } from 'svelte/transition';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	type Post = PageData['posts'][number];
	type Visibility = Post['visibility'];

	const visibilityOptions: Array<{ value: Visibility; label: string; help: string }> = [
		{ value: 'private', label: 'Private', help: 'Only you can see it.' },
		{ value: 'public', label: 'Public', help: 'Anyone can read it on your profile.' },
		{ value: 'followers', label: 'Followers', help: 'Approved followers can read it.' }
	];

	// svelte-ignore state_referenced_locally
	let content = $state(form?.action === 'create' ? (form.content ?? '') : '');
	// svelte-ignore state_referenced_locally
	let visibility = $state<Visibility>(
		form?.action === 'create' && isVisibility(form.visibility) ? form.visibility : 'private'
	);
	let wordCount = $derived(countWords(content));
	let isOverLimit = $derived(wordCount > 100);
	let isFormatted = $state(false);
	let isCreating = $state(false);
	// svelte-ignore state_referenced_locally
	let isCreateModalOpen = $state(form?.action === 'create' && !!form.error);
	let deletingPostID = $state<string | null>(null);
	let updatingPostID = $state<string | null>(null);
	// svelte-ignore state_referenced_locally
	let editingPostID = $state<string | null>(
		form?.action === 'update' ? (form.postID ?? null) : null
	);
	// svelte-ignore state_referenced_locally
	let editContent = $state(form?.action === 'update' ? (form.content ?? '') : '');
	// svelte-ignore state_referenced_locally
	let editVisibility = $state<Visibility>(
		form?.action === 'update' && isVisibility(form.visibility) ? form.visibility : 'private'
	);
	let editWordCount = $derived(countWords(editContent));
	let isEditOverLimit = $derived(editWordCount > 100);
	let postCountLabel = $derived(
		data.posts.length === 1 ? '1 post in feed' : `${data.posts.length} posts in feed`
	);

	function isVisibility(value: unknown): value is Visibility {
		return value === 'private' || value === 'public' || value === 'followers';
	}

	function visibilityLabel(value: Visibility) {
		return visibilityOptions.find((option) => option.value === value)?.label ?? 'Private';
	}

	function visibilityClass(value: Visibility) {
		if (value === 'public') return 'bg-emerald-50 text-emerald-700';
		if (value === 'followers') return 'bg-blue-50 text-blue-700';

		return 'bg-slate-100 text-slate-700';
	}

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

	function authorName(post: Post) {
		return post.author?.display_name || post.author?.username || 'Unknown author';
	}

	function startEditing(post: Post) {
		editingPostID = post.id;
		editContent = post.content;
		editVisibility = post.visibility;
	}

	function stopEditing() {
		editingPostID = null;
		editContent = '';
		editVisibility = 'private';
		updatingPostID = null;
	}

	function closeCreateModal() {
		isCreateModalOpen = false;
		isCreating = false;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isCreateModalOpen) {
			closeCreateModal();
		}
	}
</script>

<svelte:head>
	<title>MicroBlog | App</title>
</svelte:head>

<svelte:window onkeydown={handleWindowKeydown} />

<section class="mx-auto flex flex-col gap-8 px-4">
	<!-- <header class="space-y-2">
		<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Home feed</p>
		<h1 class="text-3xl font-bold tracking-tight text-slate-950">Your MicroBlog</h1>
		<p class="text-slate-600">
			Write short posts and read public or followers-only posts you are allowed to see.
		</p>
	</header> -->

	<!-- Modal button for creating a new post -->
	<button
		type="button"
		class="bg-linear-to-r flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 from-blue-50 to-emerald-50 px-4 py-4 text-base  font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transform transition duration-150 ease-out hover:shadow-md cursor-pointer hover:border-slate-400"
		onclick={() => (isCreateModalOpen = true)}
	>
		<span class="w-full text-center">
			What's on your mind? Share privately or with your followers and beyond
		</span>
	</button>

	{#if isCreateModalOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
			transition:fade={{ duration: 120 }}
		>
			<button
				type="button"
				class="absolute inset-0 bg-slate-950/60"
				aria-label="Close post creation modal"
				onclick={closeCreateModal}
			></button>

			<form
				method="POST"
				action="?/create"
				aria-labelledby="create-post-title"
				use:enhance={() => {
					isCreating = true;

					return async ({ result, update }) => {
						await update({ reset: false });
						isCreating = false;

						if (result.type === 'success') {
							content = '';
							visibility = 'private';
							isCreateModalOpen = false;
						}
					};
				}}
				class="relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
			>
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 id="create-post-title" class="text-lg font-semibold text-slate-950">New post</h2>
						<p class="mt-1 text-sm text-slate-500">Share privately or with your audience.</p>
					</div>

					<button
						type="button"
						class="rounded-full border border-slate-200 p-2 text-sm text-slate-600 hover:bg-red-100 hover:text-red-900 hover:border-red-300"
						aria-label="Close post creation modal"
						onclick={closeCreateModal}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
							aria-hidden="true"
						>
							<path d="M18 6L6 18" />
							<path d="M6 6l12 12" />
						</svg>
						<span class="sr-only">Close</span>
					</button>
				</div>

				<div class="space-y-3">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<label for="content" class="block text-sm font-medium text-slate-900">
							Post content
						</label>

						<label class="flex items-center gap-2 text-sm text-slate-600">
							<span>Visibility</span>
							<select
								name="visibility"
								bind:value={visibility}
								class="rounded-full border-slate-300 py-1.5 text-sm"
							>
								{#each visibilityOptions as option (option.value)}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						</label>
					</div>

					<PostEditor
						name="content"
						bind:content
						maxWords={100}
						mode={isFormatted ? 'formatted' : 'plain'}
					/>
					<p class="text-sm text-slate-500">
						{visibilityOptions.find((option) => option.value === visibility)?.help}
					</p>
				</div>

				<div class="flex flex-wrap items-center justify-between">
					<div class="min-h-9">
						{#if form?.action === 'create' && form.error}
							<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
								{form.error}
							</p>
						{:else if form?.action === 'create' && form.success}
							<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post saved.</p>
						{/if}
					</div>

					<div class="flex items-center gap-2 w-full">
						

						<button
							type="submit"
							disabled={isCreating || isOverLimit || wordCount === 0}
							class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 w-full"
						>
							{isCreating ? 'Saving...' : 'Post'}
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}

	<section class="space-y-4">
		<div class="flex justify-between gap-3">
			<div class="flex flex-col w-full text-center">
				<h2 class="text-xl font-semibold text-slate-950">Feed</h2>
				<p class="mt-1 text-sm text-slate-500">See what your followers and others are thinking</p>
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
				<p class="text-lg font-semibold text-slate-950">No posts yet.</p>
				<p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
					Write your first MicroBlog, or follow someone to see approved followers-only posts here.
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.posts as post (post.id)}
					{@const isOwned = post.author_id === data.currentUserId}
					<article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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

								<div class="flex flex-wrap items-center justify-between gap-3">
									<div class="text-sm font-medium text-slate-900">Edit post</div>
									<label class="flex items-center gap-2 text-sm text-slate-600">
										<span>Visibility</span>
										<select
											name="visibility"
											bind:value={editVisibility}
											class="rounded-lg border-slate-300 py-1.5 text-sm"
										>
											{#each visibilityOptions as option (option.value)}
												<option value={option.value}>{option.label}</option>
											{/each}
										</select>
									</label>
								</div>

								<PostEditor name="content" bind:content={editContent} maxWords={100} mode="plain" />

								<div class="flex flex-wrap items-center justify-between gap-3">
									{#if form?.action === 'update' && form.postID === post.id && form.error}
										<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
											{form.error}
										</p>
									{:else}
										<p class="text-sm text-slate-500">
											Editing a {visibilityLabel(editVisibility).toLowerCase()} post.
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
								<div class="flex flex-wrap items-center justify-between gap-3">
									<div class="flex items-center gap-2 text-sm text-slate-500">
										{#if post.author?.username}
											<img
												alt="avatar_{post.author.username}"
												src="https://api.dicebear.com/9.x/initials/svg?seed={post.author.username}"
												class="w-10 rounded-full"
											/>
											<div class="flex flex-col">
												<a
													href={resolve(`/u/${post.author.username}`)}
													class="font-medium text-slate-900 hover:underline"
												>
													{authorName(post)}
												</a><span>@{post.author.username}</span>
											</div>
										{:else}
											<span class="font-medium text-slate-900">{authorName(post)}</span>
										{/if}
									</div>

									<span
										class={`rounded-full px-2 py-0.5 text-xs font-medium ${visibilityClass(post.visibility)}`}
									>
										{visibilityLabel(post.visibility)}
									</span>
								</div>

								<p class="leading-7 wrap-break-word whitespace-pre-wrap text-slate-900">
									{post.content}
								</p>

								<footer
									class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"
								>
									<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
										<span>{post.word_count} {post.word_count === 1 ? 'word' : 'words'}</span>
										<span aria-hidden="true">/</span>
										<time datetime={post.created_at}>{formatPostDate(post.created_at)}</time>
										{#if wasEdited(post)}
											<span aria-hidden="true">/</span>
											<span>Edited {formatPostDate(post.updated_at)}</span>
										{/if}
									</div>

									{#if isOwned}
										<div class="flex items-center gap-2">
											<button
												type="button"
												disabled={deletingPostID === post.id}
												class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
													class="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
													aria-label="Delete post"
												>
													{deletingPostID === post.id ? 'Deleting...' : 'Delete'}
												</button>
											</form>
										</div>
									{/if}
								</footer>

								{#if post.visibility !== 'private'}
									<div class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
										<VoteButtons
											postId={post.id}
											initialLikes={post.likes}
											initialDislikes={post.dislikes}
											initialUserVote={post.userVote}
										/>

										<CommentSection
											postId={post.id}
											initialCount={post.commentCount}
											currentUserId={data.currentUserId}
											inline
										/>
									</div>
								{/if}
							</div>
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>
