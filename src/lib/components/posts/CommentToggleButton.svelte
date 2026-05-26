<script lang="ts">
	import commentIcon from '$lib/assets/comment-icon.svg';

	type Props = {
		count: number;
		expanded?: boolean;
	};

	let { count, expanded = $bindable(false) }: Props = $props();
</script>

<button
	type="button"
	aria-pressed={expanded}
	class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-slate-300 aria-pressed:bg-slate-100 aria-pressed:text-slate-900"
	onclick={() => {
		expanded = !expanded;
	}}
>
	<span>
		<img src={commentIcon} alt="" class="h-4 w-4" />
	</span>
	<span>{count}</span>
</button>
