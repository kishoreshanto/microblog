<svelte:head>
	<title>MicroBlog</title>
	<meta
		name="description"
		content="A simple and private microblogging app for short personal posts."
	/>
</svelte:head>

<main class="min-h-screen bg-neutral-950 text-white">
	<section class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
		<p class="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">
			Private microblogging
		</p>

		<h1 class="text-5xl font-bold tracking-tight sm:text-6xl">MicroBlog</h1>

		<p class="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
			Write short 100-word posts in a simple, private space. No public feed, no noise,
			no unnecessary data collection.
		</p>

		<div class="mt-10 flex flex-wrap gap-3">
			<a
				href="/auth/register"
				class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
			>
				Create account
			</a>

			<a
				href="/auth/login"
				class="rounded-full border border-neutral-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
			>
				Sign in
			</a>
		</div>
	</section>
</main>