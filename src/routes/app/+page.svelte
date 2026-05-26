<script lang="ts">
	import FeedList from '$lib/components/app/FeedList.svelte';
	import PostComposer from '$lib/components/app/PostComposer.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();
</script>

<svelte:head>
	<title>MicroBlog | App</title>
</svelte:head>

<section class="mx-auto flex flex-col gap-8 px-4">
	<PostComposer {form} />
	<FeedList {data} {form} />
</section>
