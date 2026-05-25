<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form: ActionData;
	}>();

	let isUpdating = $state(false);
	let pendingFollowID = $state<string | null>(null);
</script>

<svelte:head>
	<title>Profile | MicroBlog</title>
</svelte:head>

<section class="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
	<header class="space-y-2">
		<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Profile</p>
		<h1 class="text-3xl font-bold tracking-tight text-slate-950">Edit your profile</h1>
		<p class="text-slate-600">Your public profile is visible to anyone online.</p>
	</header>

	<form
		method="POST"
		action="?/updateProfile"
		use:enhance={() => {
			isUpdating = true;

			return async ({ update }) => {
				await update({ reset: false });
				isUpdating = false;
			};
		}}
		class="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
	>
		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-medium text-slate-900">
				Username
				<input
					name="username"
					required
					minlength="3"
					maxlength="30"
					value={form?.action === 'updateProfile'
						? (form.values?.username ?? data.profile.username)
						: data.profile.username}
					class="mt-2 w-full rounded-lg border-slate-300"
				/>
			</label>

			<label class="block text-sm font-medium text-slate-900">
				Display name
				<input
					name="display_name"
					maxlength="60"
					value={form?.action === 'updateProfile'
						? (form.values?.display_name ?? data.profile.display_name ?? '')
						: (data.profile.display_name ?? '')}
					class="mt-2 w-full rounded-lg border-slate-300"
				/>
			</label>
		</div>

		<label class="block text-sm font-medium text-slate-900">
			Bio
			<textarea name="bio" maxlength="240" rows="4" class="mt-2 w-full rounded-lg border-slate-300"
				>{form?.action === 'updateProfile'
					? (form.values?.bio ?? data.profile.bio ?? '')
					: (data.profile.bio ?? '')}</textarea
			>
		</label>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="min-h-9">
				{#if form?.action === 'updateProfile' && form.message}
					<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
				{:else if form?.action === 'updateProfile' && form.success}
					<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Profile updated.</p>
				{/if}
			</div>

			<button
				type="submit"
				disabled={isUpdating}
				class="rounded-lg border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
			>
				{isUpdating ? 'Saving...' : 'Save profile'}
			</button>
		</div>
	</form>

	<section class="space-y-4">
		<div>
			<h2 class="text-xl font-semibold text-slate-950">Follow requests</h2>
			<p class="mt-1 text-sm text-slate-500">
				Approve requests before followers can read followers-only posts.
			</p>
		</div>

		{#if (form?.action === 'approveFollow' || form?.action === 'rejectFollow') && form.message}
			<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
		{:else if form?.action === 'approveFollow' && form.success}
			<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Request approved.</p>
		{:else if form?.action === 'rejectFollow' && form.success}
			<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Request rejected.</p>
		{/if}

		{#if data.pendingRequests.length === 0}
			<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8">
				<p class="font-medium text-slate-950">No pending requests.</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.pendingRequests as request (request.id)}
					<article
						class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
					>
						<div>
							<p class="font-medium text-slate-950">
								{request.follower?.display_name || request.follower?.username || 'Unknown user'}
							</p>
							{#if request.follower?.username}
								<p class="text-sm text-slate-500">@{request.follower.username}</p>
							{/if}
						</div>

						<div class="flex items-center gap-2">
							<form
								method="POST"
								action="?/rejectFollow"
								use:enhance={() => {
									pendingFollowID = request.id;

									return async ({ update }) => {
										await update();
										pendingFollowID = null;
									};
								}}
							>
								<input type="hidden" name="followID" value={request.id} />
								<button
									type="submit"
									disabled={pendingFollowID === request.id}
									class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Reject
								</button>
							</form>

							<form
								method="POST"
								action="?/approveFollow"
								use:enhance={() => {
									pendingFollowID = request.id;

									return async ({ update }) => {
										await update();
										pendingFollowID = null;
									};
								}}
							>
								<input type="hidden" name="followID" value={request.id} />
								<button
									type="submit"
									disabled={pendingFollowID === request.id}
									class="rounded-lg border border-slate-300 bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
								>
									Approve
								</button>
							</form>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>
