<script lang="ts">
	import type { PostVisibility } from '$lib/types/posts';
	import { visibilityOptions } from '$lib/utils/posts';

	type Props = {
		value?: PostVisibility;
		name?: string;
	};

	let { value = $bindable('private'), name = 'visibility' }: Props = $props();
</script>

<input type="hidden" {name} value={value} />

<div
	class="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5"
	role="radiogroup"
	aria-label="Post visibility"
>
	{#each visibilityOptions as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.value}
			class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200
				{value === option.value
				? option.value === 'public'
					? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
					: option.value === 'followers'
						? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
						: 'bg-slate-700 text-white shadow-sm shadow-slate-300'
				: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}"
			onclick={() => (value = option.value)}
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
