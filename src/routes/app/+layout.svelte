<script lang="ts">
	import Navbar from '$lib/components/app/Navbar.svelte';
	import Footer from '$lib/components/app/Footer.svelte';

	let { data, children } = $props();
</script>

<div class="app-shell">
	<Navbar profile={data.profile} notificationPanel={data.notificationPanel} />

	<main class="app-main">
		<div class="mx-auto max-w-4xl px-6 py-10">
			{@render children()}
		</div>
	</main>

	<Footer />
</div>

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: #fff;
		color: #0a0a0a;
	}
	.app-main {
		flex: 1;
	}
</style>
