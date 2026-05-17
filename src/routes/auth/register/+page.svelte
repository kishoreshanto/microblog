<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Create account · MicroBlog</title>
</svelte:head>

<main class="min-h-screen bg-neutral-950 px-6 py-16 text-white">
	<section class="mx-auto max-w-md">
		<a href="/" class="text-sm text-neutral-400 hover:text-white">← MicroBlog</a>

		<h1 class="mt-8 text-3xl font-bold">Create account</h1>
		<p class="mt-3 text-neutral-300">Start with a private account and write short posts.</p>

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
					minlength="8"
					class="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-neutral-500"
				/>
			</div>

			<label class="flex gap-3 text-sm text-neutral-300">
				<input name="age_confirmed" type="checkbox" class="mt-1 rounded border-neutral-700" required />
				<span>I confirm that I am 16 or older.</span>
			</label>

			{#if form?.message}
				<p class="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200">
					{form.message}
				</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
			>
				Create account
			</button>
		</form>

		<p class="mt-6 text-sm text-neutral-400">
			Already have an account?
			<a href="/auth/login" class="font-medium text-white hover:underline">Sign in</a>
		</p>
	</section>
</main>