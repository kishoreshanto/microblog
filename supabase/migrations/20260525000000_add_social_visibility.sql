create table if not exists public.follows (
	id uuid primary key default gen_random_uuid(),
	follower_id uuid not null references public.profiles(id) on delete cascade,
	following_id uuid not null references public.profiles(id) on delete cascade,
	status text not null default 'pending' check (status in ('pending', 'approved')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint follows_no_self_follow check (follower_id <> following_id),
	constraint follows_unique_pair unique (follower_id, following_id)
);

create index if not exists follows_follower_status_idx on public.follows (follower_id, status);
create index if not exists follows_following_status_idx on public.follows (following_id, status);
create index if not exists posts_author_visibility_created_idx on public.posts (
	author_id,
	visibility,
	created_at desc
);
create index if not exists posts_visibility_created_idx on public.posts (visibility, created_at desc);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.follows enable row level security;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;

grant select, insert, update, delete on table public.follows to authenticated;

drop policy if exists "profiles_public_select" on public.profiles;
drop policy if exists "profiles_owner_insert" on public.profiles;
drop policy if exists "profiles_owner_update" on public.profiles;

create policy "profiles_public_select" on public.profiles
	for select
	to anon, authenticated
	using (true);

create policy "profiles_owner_insert" on public.profiles
	for insert
	to authenticated
	with check ((select auth.uid()) = id);

create policy "profiles_owner_update" on public.profiles
	for update
	to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

drop policy if exists "posts_public_select" on public.posts;
drop policy if exists "posts_owner_select" on public.posts;
drop policy if exists "posts_followers_select" on public.posts;
drop policy if exists "posts_owner_insert" on public.posts;
drop policy if exists "posts_owner_update" on public.posts;
drop policy if exists "posts_owner_delete" on public.posts;

create policy "posts_public_select" on public.posts
	for select
	to anon, authenticated
	using (visibility = 'public');

create policy "posts_owner_select" on public.posts
	for select
	to authenticated
	using ((select auth.uid()) = author_id);

create policy "posts_followers_select" on public.posts
	for select
	to authenticated
	using (
		visibility = 'followers'
		and exists (
			select 1
			from public.follows
			where follows.follower_id = (select auth.uid())
				and follows.following_id = posts.author_id
				and follows.status = 'approved'
		)
	);

create policy "posts_owner_insert" on public.posts
	for insert
	to authenticated
	with check ((select auth.uid()) = author_id);

create policy "posts_owner_update" on public.posts
	for update
	to authenticated
	using ((select auth.uid()) = author_id)
	with check ((select auth.uid()) = author_id);

create policy "posts_owner_delete" on public.posts
	for delete
	to authenticated
	using ((select auth.uid()) = author_id);

drop policy if exists "follows_participant_select" on public.follows;
drop policy if exists "follows_request_insert" on public.follows;
drop policy if exists "follows_owner_approve_update" on public.follows;
drop policy if exists "follows_participant_delete" on public.follows;

create policy "follows_participant_select" on public.follows
	for select
	to authenticated
	using ((select auth.uid()) = follower_id or (select auth.uid()) = following_id);

create policy "follows_request_insert" on public.follows
	for insert
	to authenticated
	with check ((select auth.uid()) = follower_id and status = 'pending');

create policy "follows_owner_approve_update" on public.follows
	for update
	to authenticated
	using ((select auth.uid()) = following_id)
	with check ((select auth.uid()) = following_id and status = 'approved');

create policy "follows_participant_delete" on public.follows
	for delete
	to authenticated
	using ((select auth.uid()) = follower_id or (select auth.uid()) = following_id);
