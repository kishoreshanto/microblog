<script lang="ts">
	import { navigating } from '$app/stores';
</script>

{#if $navigating}
	<div class="nav-loader" aria-hidden="true">
		<div class="nav-loader-bar"></div>
	</div>
{/if}

<style>
	.nav-loader {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		height: 3px;
		background: transparent;
		overflow: hidden;
		pointer-events: none;
	}

	.nav-loader-bar {
		height: 100%;
		width: 40%;
		background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
		border-radius: 0 2px 2px 0;
		animation: nav-slide 1s ease-in-out infinite;
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.5), 0 0 5px rgba(99, 102, 241, 0.3);
	}

	@keyframes nav-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}
</style>
