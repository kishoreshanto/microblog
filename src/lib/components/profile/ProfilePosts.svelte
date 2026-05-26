<script lang="ts">
	import PostCard from '$lib/components/posts/PostCard.svelte';
	import type { PostCardPost, PostFormState } from '$lib/types/posts';

	type PostsData = {
		posts: PostCardPost[];
		isOwner: boolean;
		relation?: { status?: string | null } | null;
	};

	let { data, form } = $props<{
		data: PostsData;
		form: PostFormState | null | undefined;
	}>();
</script>

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
				<PostCard
					{post}
					{form}
					isOwner={data.isOwner}
					showAuthor={false}
					showActions={false}
					size="profile"
					updateAction="?/updatePost"
					deleteAction="?/deletePost"
					updateFormAction="updatePost"
					deleteFormAction="deletePost"
				/>
			{/each}
		</div>
	{/if}
</section>
