<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import logo from '$lib/assets/logo.png';

	type Props = {
		profile: {
			username: string;
			display_name: string | null;
			bio: string | null;
		} | null;
	};

	let { profile }: Props = $props();
	let mobileMenuOpen = $state(false);
	let userMenuOpen = $state(false);

	function getInitials(name: string): string {
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
		return name.slice(0, 2).toUpperCase();
	}

	const navLinks = [
		{ href: '/app', label: 'Feed', icon: 'feed' },
		{ href: '/app/profile', label: 'Profile', icon: 'profile' }
	] as const;

	type NavHref = (typeof navLinks)[number]['href'];

	function isActive(path: string, href: NavHref): boolean {
		const resolved = resolve(href);
		if (href === '/app') return path === resolved;
		return path.startsWith(resolved);
	}

	function closeMenus() {
		mobileMenuOpen = false;
		userMenuOpen = false;
	}
</script>

<svelte:window
	onclick={(e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('.user-menu-container')) userMenuOpen = false;
	}}
/>

<nav
	class="sticky top-0 z-[100] border-b border-slate-200 bg-white/95 backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)]"
>
	<div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
		<a
			href={resolve('/app')}
			class="group flex items-center gap-2 text-[1.05rem] font-bold tracking-normal text-slate-950 no-underline transition-opacity duration-200 hover:opacity-80"
			onclick={closeMenus}
		>
	
			<img src={logo} alt="MicroBlog" width="30" height="30" />
			<span class="text-slate-950">MicroBlog</span>
		</a>

		<div class="flex items-center gap-1 max-sm:hidden">
			{#each navLinks as link (link.href)}
				<a
					href={resolve(link.href)}
					class={`flex items-center gap-1.5 rounded-full px-[0.85rem] py-2 text-sm no-underline transition-all duration-200 hover:bg-slate-50 hover:text-slate-950 ${
						isActive($page.url.pathname, link.href)
							? 'bg-slate-100 font-semibold text-slate-950 hover:bg-slate-200'
							: 'font-medium text-slate-600'
					}`}
					aria-current={isActive($page.url.pathname, link.href) ? 'page' : undefined}
				>
					{#if link.icon === 'feed'}
						<svg
							class="shrink-0"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
								points="9 22 9 12 15 12 15 22"
							/>
						</svg>
					{:else}
						<svg
							class="shrink-0"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
						</svg>
					{/if}
					<span>{link.label}</span>
				</a>
			{/each}
		</div>

		<div class="flex items-center gap-3">
			{#if profile}
				<div class="user-menu-container relative">
					<button
						class="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent bg-transparent py-1 pr-2.5 pl-1 transition-all duration-200 outline-none hover:border-slate-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-950"
						onclick={() => (userMenuOpen = !userMenuOpen)}
						aria-expanded={userMenuOpen}
						aria-haspopup="true"
						id="user-menu-btn"
					>
						<img
							alt="avatar_{profile.username}"
							src="https://api.dicebear.com/9.x/initials/svg?seed={profile.username}"
							class="h-10 w-10 rounded-full transition-transform duration-200 group-hover:scale-[1.06]"
						/>
						<div class="flex flex-col items-start leading-[1.3] max-sm:hidden">
							<span
								class="max-w-30 overflow-hidden text-[0.8125rem] font-semibold text-ellipsis whitespace-nowrap text-slate-950"
								>{profile.display_name || profile.username}</span
							>
							<span class="text-[0.6875rem] text-slate-500">@{profile.username}</span>
						</div>
						<svg
							class={`shrink-0 text-slate-500 transition-transform duration-200 max-sm:hidden ${userMenuOpen ? 'rotate-180' : ''}`}
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>

					{#if userMenuOpen}
						<div
							class="absolute top-[calc(100%+0.5rem)] right-0 w-60 origin-top-right rounded-[0.875rem] border border-slate-200 bg-white p-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] max-sm:hidden"
							role="menu"
							aria-labelledby="user-menu-btn"
						>
							<div class="flex items-center gap-2.5 px-2.5 pt-2.5 pb-2">
								
								<div>
									<p class="text-[0.8125rem] font-semibold text-slate-950">
										{profile.display_name || profile.username}
									</p>
									<p class="text-[0.6875rem] text-slate-500">@{profile.username}</p>
								</div>
							</div>
							<div class="mx-1.5 my-1 h-px bg-slate-200"></div>
							<a
								href={resolve(`/u/${profile.username}`)}
								class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[0.5625rem] text-left text-[0.8125rem] font-medium text-slate-700 no-underline transition-all duration-150 hover:bg-slate-50 hover:text-slate-950"
								role="menuitem"
								onclick={closeMenus}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
										cx="12"
										cy="12"
										r="3"
									/></svg
								>
								Public Profile
							</a>
							<a
								href={resolve('/app/profile')}
								class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[0.5625rem] text-left text-[0.8125rem] font-medium text-slate-700 no-underline transition-all duration-150 hover:bg-slate-50 hover:text-slate-950"
								role="menuitem"
								onclick={closeMenus}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path
										d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
									/></svg
								>
								Edit Profile
							</a>
							<div class="mx-1.5 my-1 h-px bg-slate-200"></div>
							<form method="POST" action="/auth/logout">
								<button
									type="submit"
									class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent px-2.5 py-[0.5625rem] text-left text-[0.8125rem] font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700"
									role="menuitem"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
											points="16 17 21 12 16 7"
										/><line x1="21" y1="12" x2="9" y2="12" /></svg
									>
									Sign Out
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/if}

			<button
				class="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent transition-colors duration-200 hover:bg-slate-50 max-sm:flex"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-expanded={mobileMenuOpen}
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
			>
				<div class="hamburger" class:hamburger-open={mobileMenuOpen}>
					<span></span><span></span><span></span>
				</div>
			</button>
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 max-sm:block">
			{#if profile}
				<div class="flex items-center gap-3 px-2 py-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[0.85rem] font-bold tracking-normal text-white shadow-[0_0_0_2px_#fff,0_1px_3px_rgba(15,23,42,0.08)]"
					>
						{getInitials(profile.display_name || profile.username)}
					</div>
					<div>
						<p class="text-[0.9375rem] font-semibold text-slate-950">
							{profile.display_name || profile.username}
						</p>
						<p class="text-xs text-slate-500">@{profile.username}</p>
					</div>
				</div>
				<div class="my-1.5 h-px bg-slate-200"></div>
			{/if}
			{#each navLinks as link (link.href)}
				<a
					href={resolve(link.href)}
					class={`flex w-full items-center gap-3 rounded-[0.625rem] px-2.5 py-3 text-left text-[0.9375rem] no-underline transition-all duration-150 hover:bg-slate-50 hover:text-slate-950 ${
						isActive($page.url.pathname, link.href)
							? 'bg-slate-100 font-semibold text-slate-950'
							: 'font-medium text-slate-600'
					}`}
					onclick={closeMenus}
				>
					{#if link.icon === 'feed'}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
								points="9 22 9 12 15 12 15 22"
							/></svg
						>
					{:else}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
								cx="12"
								cy="7"
								r="4"
							/></svg
						>
					{/if}
					{link.label}
				</a>
			{/each}
			{#if profile}
				<a
					href={resolve(`/u/${profile.username}`)}
					class="flex w-full items-center gap-3 rounded-[0.625rem] px-2.5 py-3 text-left text-[0.9375rem] font-medium text-slate-600 no-underline transition-all duration-150 hover:bg-slate-50 hover:text-slate-950"
					onclick={closeMenus}
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle
							cx="12"
							cy="12"
							r="3"
						/></svg
					>
					Public Profile
				</a>
				<div class="my-1.5 h-px bg-slate-200"></div>
				<form method="POST" action="/auth/logout" class="w-full">
					<button
						type="submit"
						class="flex w-full cursor-pointer items-center gap-3 rounded-[0.625rem] border-none bg-transparent px-2.5 py-3 text-left text-[0.9375rem] font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700"
						onclick={closeMenus}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
								points="16 17 21 12 16 7"
							/><line x1="21" y1="12" x2="9" y2="12" /></svg
						>
						Sign Out
					</button>
				</form>
			{/if}
		</div>
	{/if}
</nav>
