<script lang="ts">
	import PostCard from '$lib/components/posts/PostCard.svelte';
	import type { PostCardPost, PostFormState } from '$lib/types/posts';

	type PostsData = {
		posts: PostCardPost[];
		currentUserId: string;
		loaderror?: string | null;
	};

	let { data, form } = $props<{
		data: PostsData;
		form: PostFormState | null | undefined;
	}>();
</script>

<section class="space-y-4">
	<div class="flex justify-between gap-3">
		<div class="flex w-full flex-col text-center">
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
				<PostCard
					{post}
					{form}
					currentUserId={data.currentUserId}
					isOwner={post.author_id === data.currentUserId}
				/>
			{/each}
		</div>
	{/if}
</section>
