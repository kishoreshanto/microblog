<script lang="ts">
	import { enhance } from '$app/forms';
	import PostEditor from '$lib/components/posts/PostEditor.svelte';
	import { countWords } from '$lib/utils/words';
	import { fade } from 'svelte/transition';

	type Visibility = 'public' | 'followers' | 'private';

	type CreateForm = {
		action?: string;
		error?: string;
		success?: boolean;
		content?: string;
		visibility?: unknown;
	};

	let { form } = $props<{
		form: CreateForm | null | undefined;
	}>();

	const visibilityOptions: Array<{ value: Visibility; label: string; help: string; icon: string }> =
		[
			{
				value: 'public',
				label: 'Public',
				help: 'Anyone can read it on your profile.',
				icon: 'globe'
			},
			{
				value: 'followers',
				label: 'Followers',
				help: 'Approved followers can read it.',
				icon: 'users'
			},
			{ value: 'private', label: 'Private', help: 'Only you can see it.', icon: 'lock' }
		];

	// svelte-ignore state_referenced_locally
	let content = $state(form?.action === 'create' ? (form.content ?? '') : '');
	// svelte-ignore state_referenced_locally
	let visibility = $state<Visibility>(
		form?.action === 'create' && isVisibility(form.visibility) ? form.visibility : 'private'
	);
	let wordCount = $derived(countWords(content));
	let isOverLimit = $derived(wordCount > 100);
	let isFormatted = $state(false);
	let isCreating = $state(false);
	// svelte-ignore state_referenced_locally
	let isCreateModalOpen = $state(form?.action === 'create' && !!form.error);

	function isVisibility(value: unknown): value is Visibility {
		return value === 'private' || value === 'public' || value === 'followers';
	}

	function closeCreateModal() {
		isCreateModalOpen = false;
		isCreating = false;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isCreateModalOpen) {
			closeCreateModal();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<button
	type="button"
	class="flex w-full transform cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 bg-linear-to-r from-blue-50 to-emerald-50 px-4 py-4 text-base font-medium text-slate-500 transition duration-150 ease-out hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 hover:shadow-md"
	onclick={() => (isCreateModalOpen = true)}
>
	<span class="w-full text-center">
		What's on your mind? Share privately or with your followers and beyond
	</span>
</button>

{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
		transition:fade={{ duration: 120 }}
	>
		<button
			type="button"
			class="absolute inset-0 bg-slate-950/60"
			aria-label="Close post creation modal"
			onclick={closeCreateModal}
		></button>

		<form
			method="POST"
			action="?/create"
			aria-labelledby="create-post-title"
			use:enhance={() => {
				isCreating = true;

				return async ({ result, update }) => {
					await update({ reset: false });
					isCreating = false;

					if (result.type === 'success') {
						content = '';
						visibility = 'private';
						isCreateModalOpen = false;
					}
				};
			}}
			class="relative z-10 max-h-[calc(100vh-3rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
		>
			<div class="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 id="create-post-title" class="text-lg font-semibold text-slate-950">New post</h2>
					<p class="mt-1 text-sm text-slate-500">Share privately or with your audience.</p>
				</div>

				<button
					type="button"
					class="rounded-full border border-slate-200 p-2 text-sm text-slate-600 hover:border-red-300 hover:bg-red-100 hover:text-red-900"
					aria-label="Close post creation modal"
					onclick={closeCreateModal}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-4 w-4"
						aria-hidden="true"
					>
						<path d="M18 6L6 18" />
						<path d="M6 6l12 12" />
					</svg>
					<span class="sr-only">Close</span>
				</button>
			</div>

			<div class="space-y-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<label for="content" class="block text-sm font-medium text-slate-900">
						Post content
					</label>

					<input type="hidden" name="visibility" value={visibility} />
					<div
						class="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
						role="radiogroup"
						aria-label="Post visibility"
					>
						{#each visibilityOptions as option (option.value)}
							<button
								type="button"
								role="radio"
								aria-checked={visibility === option.value}
								class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
									{visibility === option.value
									? option.value === 'public'
										? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
										: option.value === 'followers'
											? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
											: 'bg-slate-700 text-white shadow-sm shadow-slate-300'
									: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
								onclick={() => (visibility = option.value)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-3.5 w-3.5"
									aria-hidden="true"
								>
									{#if option.icon === 'globe'}
										<circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path
											d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
										/>
									{:else if option.icon === 'users'}
										<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle
											cx="9"
											cy="7"
											r="4"
										/><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path
											d="M16 3.13a4 4 0 0 1 0 7.75"
										/>
									{:else}
										<rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
											d="M7 11V7a5 5 0 0 1 10 0v4"
										/>
									{/if}
								</svg>
								<span>{option.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<PostEditor
					name="content"
					bind:content
					maxWords={100}
					mode={isFormatted ? 'formatted' : 'plain'}
				/>
				<p class="text-sm text-slate-500">
					{visibilityOptions.find((option) => option.value === visibility)?.help}
				</p>
			</div>

			<div class="flex flex-wrap items-center justify-between">
				<div class="min-h-9">
					{#if form?.action === 'create' && form.error}
						<p class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{form.error}
						</p>
					{:else if form?.action === 'create' && form.success}
						<p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Post saved.</p>
					{/if}
				</div>

				<div class="flex w-full items-center gap-2">
					<button
						type="submit"
						disabled={isCreating || isOverLimit || wordCount === 0}
						class="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
					>
						{isCreating ? 'Saving...' : 'Post'}
					</button>
				</div>
			</div>
		</form>
	</div>
{/if}
