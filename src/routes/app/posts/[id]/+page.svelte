<script lang="ts">
	import { resolve } from '$app/paths';
	import PostCard from '$lib/components/posts/PostCard.svelte';
	import { authorName } from '$lib/utils/posts';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	let pageTitle = $derived(`${authorName(data.post)}'s post | MicroBlog`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<section class="mx-auto flex max-w-3xl flex-col gap-6">
	<header class="flex flex-wrap items-center justify-between gap-3">
		<a
			href={resolve('/app')}
			class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
		>
			<span aria-hidden="true">←</span>
			<span>Back to feed</span>
		</a>

		{#if form?.action === 'update' && form.success}
			<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post updated.</p>
		{/if}
	</header>

	<PostCard
		post={data.post}
		{form}
		currentUserId={data.currentUserId}
		isOwner={data.isOwner}
		size="single"
		showPrivateNote
	/>
</section>
