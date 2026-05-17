<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Sign in · MicroBlog</title>
</svelte:head>

<main class="min-h-screen bg-neutral-950 px-6 py-16 text-white">
	<section class="mx-auto max-w-md">
		<a href="/" class="text-sm text-neutral-400 hover:text-white">← MicroBlog</a>

		<h1 class="mt-8 text-3xl font-bold">Sign in</h1>
		<p class="mt-3 text-neutral-300">Access your private MicroBlog space.</p>

		<form method="POST" class="mt-8 space-y-5">
			<div>
				<label for="email" class="block text-sm font-medium text-neutral-200">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					value={form?.values?.email ?? ''}
					class="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-neutral-500"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-neutral-200">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
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
				Sign in
			</button>
		</form>

		<p class="mt-6 text-sm text-neutral-400">
			Need an account?
			<a href="/auth/register" class="font-medium text-white hover:underline">Create account</a>
		</p>
	</section>
</main>