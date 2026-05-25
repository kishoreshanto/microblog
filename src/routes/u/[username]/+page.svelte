<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import PostEditor from '$lib/components/posts/PostEditor.svelte';
	import { countWords } from '$lib/utils/words';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	type Post = PageData['posts'][number];
	type Visibility = Post['visibility'];

	const visibilityOptions: Array<{ value: Visibility; label: string }> = [
		{ value: 'private', label: 'Private' },
		{ value: 'public', label: 'Public' },
		{ value: 'followers', label: 'Followers' }
	];

	let isSubmittingFollow = $state(false);
	let deletingPostID = $state<string | null>(null);
	let updatingPostID = $state<string | null>(null);
	// svelte-ignore state_referenced_locally
	let editingPostID = $state<string | null>(
		form?.action === 'updatePost' ? (form.postID ?? null) : null
	);
	// svelte-ignore state_referenced_locally
	let editContent = $state(form?.action === 'updatePost' ? (form.content ?? '') : '');
	// svelte-ignore state_referenced_locally
	let editVisibility = $state<Visibility>(
		form?.action === 'updatePost' && isVisibility(form.visibility) ? form.visibility : 'private'
	);
	let editWordCount = $derived(countWords(editContent));
	let isEditOverLimit = $derived(editWordCount > 100);

	function isVisibility(value: unknown): value is Visibility {
		return value === 'private' || value === 'public' || value === 'followers';
	}

	function formatPostDate(value: string) {
		return new Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(value));
	}

	function visibilityLabel(value: Visibility) {
		return visibilityOptions.find((option) => option.value === value)?.label ?? 'Private';
	}

	function visibilityClass(value: Visibility) {
		if (value === 'public') return 'bg-emerald-50 text-emerald-700';
		if (value === 'followers') return 'bg-blue-50 text-blue-700';

		return 'bg-slate-100 text-slate-700';
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
</script>

<svelte:head>
	<title>{data.profile.display_name || data.profile.username} | MicroBlog</title>
</svelte:head>

<main class="min-h-screen bg-white text-slate-950">
	<section class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
		<header class="space-y-5 border-b border-slate-200 pb-8">
			<a href={resolve('/')} class="text-sm font-medium text-slate-500 hover:text-slate-950">
				MicroBlog
			</a>

			<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Profile</p>


			<div class="flex flex-wrap items-start justify-between gap-4">
				<div class="flex items-center gap-5">
					<img
						alt="avatar_{data.profile.username}"
						src="https://api.dicebear.com/9.x/initials/svg?seed={data.profile.username}"
						class="h-20 rounded-full"
					/>
					<div class="flex flex-col">
						<h1 class=" text-3xl font-bold tracking-tight">
						{data.profile.display_name || data.profile.username}
					</h1>
					<p class="mt-1 text-slate-500">@{data.profile.username}</p>
					</div>
					
				</div>

				{#if data.isOwner}
					<a
						href={resolve('/app/profile')}
						class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						Edit profile
					</a>
				{:else if data.isSignedIn}
					{#if data.relation?.status === 'approved'}
						<form
							method="POST"
							action="?/unfollow"
							use:enhance={() => {
								isSubmittingFollow = true;

								return async ({ update }) => {
									await update();
									isSubmittingFollow = false;
								};
							}}
						>
							<button
								type="submit"
								disabled={isSubmittingFollow}
								class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Unfollow
							</button>
						</form>
					{:else if data.relation?.status === 'pending'}
						<form
							method="POST"
							action="?/cancelFollow"
							use:enhance={() => {
								isSubmittingFollow = true;

								return async ({ update }) => {
									await update();
									isSubmittingFollow = false;
								};
							}}
						>
							<button
								type="submit"
								disabled={isSubmittingFollow}
								class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Cancel request
							</button>
						</form>
					{:else}
						<form
							method="POST"
							action="?/requestFollow"
							use:enhance={() => {
								isSubmittingFollow = true;

								return async ({ update }) => {
									await update();
									isSubmittingFollow = false;
								};
							}}
						>
							<button
								type="submit"
								disabled={isSubmittingFollow}
								class="rounded-lg border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
							>
								Request follow
							</button>
						</form>
					{/if}
				{:else}
					<a
						href={resolve('/auth/login')}
						class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						Sign in to follow
					</a>
				{/if}
			</div>

			{#if data.profile.bio}
				<p class="max-w-xl leading-7 whitespace-pre-wrap text-slate-700">{data.profile.bio}</p>
			{/if}

			{#if form?.message && form.action !== 'updatePost' && form.action !== 'deletePost'}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{:else if form?.action === 'requestFollow' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Follow request sent.</p>
			{:else if form?.action === 'cancelFollow' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
					Follow request canceled.
				</p>
			{:else if form?.action === 'unfollow' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
					You are no longer following this profile.
				</p>
			{/if}
		</header>

		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-semibold">Posts</h2>
				<p class="mt-1 text-sm text-slate-500">
					{#if data.isOwner}
						All posts from this profile.
					{:else if data.relation?.status === 'approved'}
						Public and followers-only posts from this profile.
					{:else}
						Public posts from this profile.
					{/if}
				</p>
			</div>

			{#if form?.action === 'deletePost' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post deleted.</p>
			{:else if form?.action === 'updatePost' && form.success}
				<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post updated.</p>
			{:else if (form?.action === 'deletePost' || form?.action === 'updatePost') && form.message}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
			{/if}

			{#if data.posts.length === 0}
				<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
					<p class="font-medium text-slate-950">No visible posts.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.posts as post (post.id)}
						<article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
							{#if editingPostID === post.id}
								<form
									method="POST"
									action="?/updatePost"
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
												class="rounded-full border-slate-300 py-1.5 text-sm"
											>
												{#each visibilityOptions as option (option.value)}
													<option value={option.value}>{option.label}</option>
												{/each}
											</select>
										</label>
									</div>

									<PostEditor name="content" bind:content={editContent} maxWords={100} mode="plain" />

									<div class="flex flex-wrap items-center justify-between gap-3">
										{#if form?.action === 'updatePost' && form.postID === post.id && form.message}
											<p class="rounded-full bg-red-50 px-3 py-2 text-sm text-red-700">
												{form.message}
											</p>
										{:else}
											<p class="text-sm text-slate-500">
												{editWordCount}/100 words
											</p>
										{/if}

										<div class="flex items-center gap-2">
											<button
												type="button"
												disabled={updatingPostID === post.id}
												class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
												onclick={stopEditing}
											>
												Cancel
											</button>

											<button
												type="submit"
												disabled={updatingPostID === post.id ||
													isEditOverLimit ||
													editWordCount === 0}
												class="rounded-full border border-slate-300 bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
											>
												{updatingPostID === post.id ? 'Saving...' : 'Save changes'}
											</button>
										</div>
									</div>
								</form>
							{:else}
								<div
									class="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"
								>
									<time datetime={post.created_at}>{formatPostDate(post.created_at)}</time>
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
									class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"
								>
									<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
										<span>
											{post.word_count}
											{post.word_count === 1 ? 'word' : 'words'}
										</span>

										{#if post.visibility !== 'private'}
											<span aria-label={`${post.likes} likes`}>Likes {post.likes}</span>
											<span aria-label={`${post.dislikes} dislikes`}>Dislikes {post.dislikes}</span>
										{/if}
									</div>

									{#if data.isOwner}
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
												action="?/deletePost"
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
												>
													{deletingPostID === post.id ? 'Deleting...' : 'Delete'}
												</button>
											</form>
										</div>
									{/if}
								</footer>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</section>
</main>
