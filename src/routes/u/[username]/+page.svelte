<script lang="ts">
	import ProfileHeader from '$lib/components/profile/ProfileHeader.svelte';
	import ProfilePosts from '$lib/components/profile/ProfilePosts.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();
</script>

<svelte:head>
	<title>{data.profile.display_name || data.profile.username} | MicroBlog</title>
</svelte:head>

<main class="min-h-screen bg-white text-slate-950">
	<section class="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
		<ProfileHeader {data} {form} />
		<ProfilePosts {data} {form} />
	</section>
</main>
