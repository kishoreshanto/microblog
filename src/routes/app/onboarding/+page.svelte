<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Set up profile · MicroBlog</title>
</svelte:head>

<section class="mx-auto max-w-md">
	<h1 class="text-3xl font-bold">Set up your profile</h1>
	<p class="mt-3 text-neutral-300">Choose a username for your private MicroBlog account.</p>

	<form method="POST" class="mt-8 space-y-5">
		<div>
			<label for="username" class="block text-sm font-medium text-neutral-200">Username</label>
			<input
				id="username"
				name="username"
				required
				minlength="3"
				maxlength="30"
				pattern="[a-zA-Z0-9_]+"
				value={form?.values?.username ?? ''}
				class="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-neutral-500"
			/>
			<p class="mt-2 text-xs text-neutral-500">Letters, numbers, and underscores only.</p>
		</div>

		<div>
			<label for="display_name" class="block text-sm font-medium text-neutral-200">
				Display name
			</label>
			<input
				id="display_name"
				name="display_name"
				maxlength="60"
				value={form?.values?.display_name ?? ''}
				class="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-neutral-500"
			/>
		</div>

		{#if form?.message}
			<p class="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
				{form.message}
			</p>
		{/if}

		<button
			type="submit"
			class="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
		>
			Continue
		</button>
	</form>
</section>
