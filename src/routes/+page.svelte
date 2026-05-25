<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>MicroBlog</title>
	<meta
		name="description"
		content="A simple and private microblogging app for short personal posts."
	/>
</svelte:head>

<main class="min-h-screen bg-white text-neutral-950 dark:bg-gray-950">
	<section class="mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 py-16">
		<p class="mb-4 text-sm font-medium tracking-[0.3em] text-neutral-500 uppercase">
			A place for your thoughts
		</p>

		<h1 class="text-5xl font-bold tracking-tight sm:text-6xl dark:text-white">MicroBlog</h1>

		<p class="mt-6 text-lg leading-8 text-neutral-600">
			Write short 100-word posts in a simple, private space. No public feed, no noise, no
			unnecessary data collection.
		</p>

		<div class="mt-10 flex flex-wrap gap-3">
			<a
				href={resolve('/auth/register')}
				class="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-300 dark:hover:text-neutral-950"
			>
				Create account
			</a>

			<a
				href={resolve('/auth/login')}
				class="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-300 dark:hover:text-neutral-950"
			>
				Sign in
			</a>
		</div>
	</section>
</main>
