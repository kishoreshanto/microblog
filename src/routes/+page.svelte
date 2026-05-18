<svelte:head>
	<title>MicroBlog</title>
	<meta
		name="description"
		content="A simple and private microblogging app for short personal posts."
	/>
</svelte:head>

<main class="min-h-screen bg-white text-neutral-950">
	<section class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
		<p class="mb-4 text-sm font-medium tracking-[0.3em] text-neutral-500 uppercase">
			Private microblogging
		</p>

		<h1 class="text-5xl font-bold tracking-tight sm:text-6xl">MicroBlog</h1>

		<p class="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
			Write short 100-word posts in a simple, private space. No public feed, no noise, no
			unnecessary data collection.
		</p>

		<div class="mt-10 flex flex-wrap gap-3">
			<a
				href="/auth/register"
				class="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
			>
				Create account
			</a>

			<a
				href="/auth/login"
				class="rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
			>
				Sign in
			</a>
		</div>
	</section>
</main>
