<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>App · MicroBlog</title>
</svelte:head>

<section>
	<p class="text-sm text-neutral-400">Private space</p>

	<h1 class="mt-3 text-3xl font-bold">
		Welcome{data.profile?.display_name ? `, ${data.profile.display_name}` : ''}
	</h1>

	<p class="mt-4 max-w-xl text-neutral-300">
		Your account is ready. Next, we will add the 100-word post composer and private feed.
	</p>

	<div class="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
		<h2 class="text-lg font-semibold">Privacy status</h2>
		<ul class="mt-4 space-y-2 text-sm text-neutral-300">
			<li>Posts are private by default.</li>
			<li>No public feed is enabled.</li>
			<li>Profile and post access are protected by RLS.</li>
		</ul>
	</div>
</section>
