<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	type Profile = {
		display_name: string | null;
		username: string;
		bio?: string | null;
	};

	type ProfileData = {
		profile: Profile;
		isOwner: boolean;
		isSignedIn: boolean;
		relation?: { status?: string | null } | null;
	};

	type ProfileForm = {
		action?: string;
		success?: boolean;
		message?: string;
	};

	let { data, form } = $props<{
		data: ProfileData;
		form: ProfileForm | null | undefined;
	}>();

	let isSubmittingFollow = $state(false);
</script>

<header class="space-y-5 border-b border-slate-200 pb-8">
	<a href={resolve('/')} class="text-sm font-medium text-slate-500 hover:text-slate-950">
		MicroBlog
	</a>

	<p class="text-sm font-medium tracking-wide text-slate-500 uppercase">Profile</p>

	<div class="flex flex-wrap items-start justify-between gap-4">
		<div class="flex items-center gap-5">
			<img
				alt="avatar_{data.profile.username}"
				src="https://api.dicebear.com/9.x/initials/svg?seed={data.profile.username}"
				class="h-20 rounded-full"
			/>
			<div class="flex flex-col">
				<h1 class=" text-3xl font-bold tracking-tight">
					{data.profile.display_name || data.profile.username}
				</h1>
				<p class="mt-1 text-slate-500">@{data.profile.username}</p>
			</div>
		</div>

		{#if data.isOwner}
			<a
				href={resolve('/app/profile')}
				class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				Edit profile
			</a>
		{:else if data.isSignedIn}
			{#if data.relation?.status === 'approved'}
				<form
					method="POST"
					action="?/unfollow"
					use:enhance={() => {
						isSubmittingFollow = true;

						return async ({ update }) => {
							await update();
							isSubmittingFollow = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={isSubmittingFollow}
						class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Unfollow
					</button>
				</form>
			{:else if data.relation?.status === 'pending'}
				<form
					method="POST"
					action="?/cancelFollow"
					use:enhance={() => {
						isSubmittingFollow = true;

						return async ({ update }) => {
							await update();
							isSubmittingFollow = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={isSubmittingFollow}
						class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Cancel request
					</button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/requestFollow"
					use:enhance={() => {
						isSubmittingFollow = true;

						return async ({ update }) => {
							await update();
							isSubmittingFollow = false;
						};
					}}
				>
					<button
						type="submit"
						disabled={isSubmittingFollow}
						class="rounded-lg border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200"
					>
						Request follow
					</button>
				</form>
			{/if}
		{:else}
			<a
				href={resolve('/auth/login')}
				class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
			>
				Sign in to follow
			</a>
		{/if}
	</div>

	{#if data.profile.bio}
		<p class="max-w-xl leading-7 whitespace-pre-wrap text-slate-700">{data.profile.bio}</p>
	{/if}

	{#if form?.message && form.action !== 'updatePost' && form.action !== 'deletePost'}
		<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{form.message}</p>
	{:else if form?.action === 'requestFollow' && form.success}
		<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Follow request sent.</p>
	{:else if form?.action === 'cancelFollow' && form.success}
		<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
			Follow request canceled.
		</p>
	{:else if form?.action === 'unfollow' && form.success}
		<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
			You are no longer following this profile.
		</p>
	{/if}
</header>
