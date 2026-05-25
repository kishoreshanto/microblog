<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	type Visibility = PageData['posts'][number]['visibility'];

	let isSubmittingFollow = $state(false);

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
		if (value === 'followers') return 'Followers';
		if (value === 'public') return 'Public';

		return 'Private';
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

			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Profile</p>
					<h1 class="mt-2 text-3xl font-bold tracking-tight">
						{data.profile.display_name || data.profile.username}
					</h1>
					<p class="mt-1 text-slate-500">@{data.profile.username}</p>
				</div>

				{#if data.isOwner}
					<a
						href={resolve('/app/profile')}
						class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

			{#if form?.message}
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

			{#if data.posts.length === 0}
				<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
					<p class="font-medium text-slate-950">No visible posts.</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.posts as post (post.id)}
						<article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
							<div
								class="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"
							>
								<time datetime={post.created_at}>{formatPostDate(post.created_at)}</time>
								<span
									class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
								>
									{visibilityLabel(post.visibility)}
								</span>
							</div>

							<p class="leading-7 wrap-break-word whitespace-pre-wrap text-slate-900">
								{post.content}
							</p>

							<footer class="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
								{post.word_count}
								{post.word_count === 1 ? 'word' : 'words'}
							</footer>
						</article>
					{/each}
				</div>
			{/if}
		</section>
	</section>
</main>
