<script lang="ts">
	import { resolve } from '$app/paths';

	let { form } = $props();
</script>

<svelte:head>
	<title>Create account · MicroBlog</title>
</svelte:head>

<main class="min-h-screen bg-white dark:bg-gray-950 px-6 py-16 text-neutral-950">
	<section class="mx-auto max-w-md">
		<a href={resolve('/')} class="text-sm text-neutral-500 hover:text-neutral-950">
			<span>
			<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=arrow_back_ios" />
			</span> 
			Back to Home</a>

		<h1 class="mt-8 text-3xl font-bold dark:text-white">Create account</h1>
		<p class="mt-3 text-neutral-600 dark:text-neutral-400">Start with an account and write short posts</p>

		<form method="POST" class="mt-8 space-y-5">
			<div>
				<label for="email" class="block text-sm font-medium text-neutral-800 dark:text-white">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					value={form?.values?.email ?? ''}
					class="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-600"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-neutral-800">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minlength="8"
					class="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none focus:border-neutral-600"
				/>
			</div>

			<label class="flex gap-3 text-sm text-neutral-600">
				<input
					name="age_confirmed"
					type="checkbox"
					class="mt-1 rounded border-neutral-300"
					required
				/>
				<span>I confirm that I am 16 or older.</span>
			</label>

			{#if form?.message}
				<p class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.message}
				</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
			>
				Create account
			</button>
		</form>

		<p class="mt-6 text-sm text-neutral-600">
			Already have an account?
			<a href={resolve('/auth/login')} class="font-medium text-neutral-950 hover:underline"
				>Sign in</a
			>
		</p>
	</section>
</main>
