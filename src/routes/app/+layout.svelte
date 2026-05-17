<script lang="ts">
	let { data, children } = $props();
</script>

<main class="min-h-screen bg-neutral-950 text-white">
	<header class="border-b border-neutral-900">
		<div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
			<a href="/app" class="font-semibold">MicroBlog</a>

			<div class="flex items-center gap-4">
				{#if data.profile}
					<span class="text-sm text-neutral-400">@{data.profile.username}</span>
				{/if}

				<form method="POST" action="/auth/logout">
					<button type="submit" class="text-sm text-neutral-400 hover:text-white">Sign out</button>
				</form>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-4xl px-6 py-10">
		{@render children()}
	</div>
</main>
