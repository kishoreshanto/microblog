<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { countWords } from '$lib/utils/words';
	import type { PostCardPost, PostFormState, PostVisibility } from '$lib/types/posts';
	import {
		authorName,
		formatPostDate,
		isVisibility,
		visibilityClass,
		visibilityHelp,
		visibilityLabel,
		wasEdited
	} from '$lib/utils/posts';
	import PostActions from './PostActions.svelte';
	import PostEditor from './PostEditor.svelte';
	import PostVisibilityPicker from './PostVisibilityPicker.svelte';

	type Size = 'feed' | 'single' | 'profile';

	type Props = {
		post: PostCardPost;
		form?: PostFormState | null;
		currentUserId?: string | null;
		isOwner?: boolean;
		showAuthor?: boolean;
		showActions?: boolean;
		showPrivateNote?: boolean;
		size?: Size;
		updateAction?: string;
		deleteAction?: string;
		updateFormAction?: string;
		deleteFormAction?: string;
	};

	let {
		post,
		form = null,
		currentUserId = null,
		isOwner = false,
		showAuthor = true,
		showActions = true,
		showPrivateNote = false,
		size = 'feed',
		updateAction = '?/update',
		deleteAction = '?/delete',
		updateFormAction = 'update',
		deleteFormAction = 'delete'
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let isEditing = $state(form?.action === updateFormAction && form.postID === post.id);
	let isDeleting = $state(false);
	let isUpdating = $state(false);
	// svelte-ignore state_referenced_locally
	let editContent = $state(
		form?.action === updateFormAction && form.postID === post.id ? (form.content ?? '') : post.content
	);
	// svelte-ignore state_referenced_locally
	let editVisibility = $state<PostVisibility>(
		form?.action === updateFormAction && form.postID === post.id && isVisibility(form.visibility)
			? form.visibility
			: post.visibility
	);
	let editWordCount = $derived(countWords(editContent));
	let isEditOverLimit = $derived(editWordCount > 100);
	let postTextClass = $derived(
		size === 'single'
			? 'text-lg leading-8 wrap-break-word whitespace-pre-wrap text-slate-950'
			: 'leading-7 wrap-break-word whitespace-pre-wrap text-slate-900'
	);
	let updateError = $derived(
		form?.action === updateFormAction && form.postID === post.id ? (form.error ?? form.message) : null
	);
	let deleteError = $derived(form?.action === deleteFormAction ? (form.error ?? form.message) : null);

	function startEditing() {
		isEditing = true;
		editContent = post.content;
		editVisibility = post.visibility;
	}

	function stopEditing() {
		isEditing = false;
		editContent = post.content;
		editVisibility = post.visibility;
		isUpdating = false;
	}
</script>

<article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
	{#if isEditing}
		<form
			method="POST"
			action={updateAction}
			use:enhance={() => {
				isUpdating = true;

				return async ({ result, update }) => {
					await update({ reset: false });
					isUpdating = false;

					if (result.type === 'success') {
						isEditing = false;
					}
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="postID" value={post.id} />

			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="text-lg font-semibold text-slate-950">Edit post</h2>
					<p class="mt-1 text-sm text-slate-500">{visibilityHelp(editVisibility)}</p>
				</div>

				<PostVisibilityPicker bind:value={editVisibility} />
			</div>

			<PostEditor name="content" bind:content={editContent} maxWords={100} mode="plain" />

			<div class="flex flex-wrap items-center justify-between gap-3">
				{#if updateError}
					<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{updateError}</p>
				{:else}
					<p class="text-sm text-slate-500">{editWordCount}/100 words</p>
				{/if}

				<div class="flex items-center gap-2">
					<button
						type="button"
						disabled={isUpdating}
						class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
						onclick={stopEditing}
					>
						Cancel
					</button>

					<button
						type="submit"
						disabled={isUpdating || isEditOverLimit || editWordCount === 0}
						class="rounded-full border border-slate-300 bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
					>
						{isUpdating ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</div>
		</form>
	{:else}
		<div class={size === 'single' ? 'space-y-5' : 'space-y-4'}>
			<div class="flex flex-wrap items-start justify-between gap-3">
				{#if showAuthor}
					<div class="flex items-center gap-3 text-sm text-slate-500">
						{#if post.author?.username}
							<img
								alt="avatar_{post.author.username}"
								src="https://api.dicebear.com/9.x/initials/svg?seed={post.author.username}"
								class={size === 'single' ? 'h-12 w-12 rounded-full' : 'h-10 w-10 rounded-full'}
							/>
							<div class="flex flex-col">
								<a
									href={resolve(`/u/${post.author.username}`)}
									class="font-medium text-slate-900 hover:underline"
								>
									{authorName(post)}
								</a>
								<span>@{post.author.username}</span>
							</div>
						{:else}
							<span class="font-medium text-slate-900">{authorName(post)}</span>
						{/if}
					</div>
				{:else}
					<time datetime={post.created_at} class="text-sm text-slate-500">
						{formatPostDate(post.created_at)}
					</time>
				{/if}

				<span
					class={`rounded-full px-2 py-0.5 text-xs font-medium ${visibilityClass(post.visibility)}`}
				>
					{visibilityLabel(post.visibility)}
				</span>
			</div>

			<p class={postTextClass}>
				{post.content}
			</p>

			<footer
				class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"
			>
				<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span>{post.word_count} {post.word_count === 1 ? 'word' : 'words'}</span>
					{#if showAuthor}
						<span aria-hidden="true">/</span>
						<time datetime={post.created_at}>{formatPostDate(post.created_at)}</time>
					{/if}
					{#if wasEdited(post)}
						<span aria-hidden="true">/</span>
						<span>Edited {formatPostDate(post.updated_at ?? post.created_at)}</span>
					{/if}

					{#if !showActions && post.visibility !== 'private'}
						<span aria-hidden="true">/</span>
						<span aria-label={`${post.likes ?? 0} likes`}>Likes {post.likes ?? 0}</span>
						<span aria-label={`${post.dislikes ?? 0} dislikes`}>Dislikes {post.dislikes ?? 0}</span>
					{/if}
				</div>

				{#if isOwner}
					<div class="flex items-center gap-2">
						<button
							type="button"
							disabled={isDeleting}
							class="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
							onclick={startEditing}
						>
							Edit
						</button>

						<form
							method="POST"
							action={deleteAction}
							onsubmit={(event) => {
								if (!confirm('Delete this post? This cannot be undone.')) {
									event.preventDefault();
								}
							}}
							use:enhance={() => {
								isDeleting = true;

								return async ({ update }) => {
									await update();
									isDeleting = false;
								};
							}}
						>
							<input type="hidden" name="postID" value={post.id} />

							<button
								type="submit"
								disabled={isDeleting}
								class="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
								aria-label="Delete post"
							>
								{isDeleting ? 'Deleting...' : 'Delete'}
							</button>
						</form>
					</div>
				{/if}
			</footer>

			{#if deleteError}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</p>
			{/if}

			{#if showActions && currentUserId && post.visibility !== 'private'}
				<div class="border-t border-slate-100 pt-4">
					<PostActions
						postId={post.id}
						initialLikes={post.likes ?? 0}
						initialDislikes={post.dislikes ?? 0}
						initialUserVote={post.userVote ?? null}
						initialCommentCount={post.commentCount ?? 0}
						{currentUserId}
					/>
				</div>
			{:else if showPrivateNote && post.visibility === 'private'}
				<p class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
					This private post is only visible to you.
				</p>
			{/if}
		</div>
	{/if}
</article>
