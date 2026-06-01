create table if not exists public.post_votes (
	id uuid primary key default gen_random_uuid(),
	post_id uuid not null references public.posts(id) on delete cascade,
	user_id uuid not null references public.profiles(id) on delete cascade,
	vote_type smallint not null check (vote_type in (1, -1)),
	created_at timestamptz not null default now(),
	constraint post_votes_unique_user_post unique (user_id, post_id)
);

create table if not exists public.comments (
	id uuid primary key default gen_random_uuid(),
	post_id uuid not null references public.posts(id) on delete cascade,
	author_id uuid not null references public.profiles(id) on delete cascade,
	parent_id uuid references public.comments(id) on delete cascade,
	content text not null check (char_length(content) between 1 and 500),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create or replace function public.enforce_comment_depth()
returns trigger as $$
begin
	if new.parent_id is not null then
		if exists (
			select 1
			from public.comments
			where id = new.parent_id
				and parent_id is not null
		) then
			raise exception 'Replies to replies are not allowed';
		end if;
	end if;

	return new;
end;
$$ language plpgsql;

drop trigger if exists check_comment_depth on public.comments;

create trigger check_comment_depth
	before insert on public.comments
	for each row execute function public.enforce_comment_depth();

create index if not exists post_votes_post_id_idx on public.post_votes (post_id);
create index if not exists post_votes_user_id_idx on public.post_votes (user_id);
create index if not exists comments_post_id_idx on public.comments (post_id, created_at);
create index if not exists comments_parent_id_idx on public.comments (parent_id);

alter table public.post_votes enable row level security;
alter table public.comments enable row level security;

grant select, insert, update, delete on table public.post_votes to authenticated;
grant select, insert, update, delete on table public.comments to authenticated;

drop policy if exists "post_votes_select_visible_posts" on public.post_votes;
drop policy if exists "post_votes_insert_own_visible_non_private" on public.post_votes;
drop policy if exists "post_votes_update_own_visible_non_private" on public.post_votes;
drop policy if exists "post_votes_delete_own" on public.post_votes;

create policy "post_votes_select_visible_posts" on public.post_votes
	for select
	to authenticated
	using (
		exists (
			select 1
			from public.posts
			where posts.id = post_votes.post_id
				and posts.visibility <> 'private'
		)
	);

create policy "post_votes_insert_own_visible_non_private" on public.post_votes
	for insert
	to authenticated
	with check (
		(select auth.uid()) = user_id
		and exists (
			select 1
			from public.posts
			where posts.id = post_votes.post_id
				and posts.visibility <> 'private'
		)
	);

create policy "post_votes_update_own_visible_non_private" on public.post_votes
	for update
	to authenticated
	using ((select auth.uid()) = user_id)
	with check (
		(select auth.uid()) = user_id
		and exists (
			select 1
			from public.posts
			where posts.id = post_votes.post_id
				and posts.visibility <> 'private'
		)
	);

create policy "post_votes_delete_own" on public.post_votes
	for delete
	to authenticated
	using ((select auth.uid()) = user_id);

drop policy if exists "comments_select_visible_posts" on public.comments;
drop policy if exists "comments_insert_own_visible_non_private" on public.comments;
drop policy if exists "comments_update_own" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;

create policy "comments_select_visible_posts" on public.comments
	for select
	to authenticated
	using (
		exists (
			select 1
			from public.posts
			where posts.id = comments.post_id
				and posts.visibility <> 'private'
		)
	);

create policy "comments_insert_own_visible_non_private" on public.comments
	for insert
	to authenticated
	with check (
		(select auth.uid()) = author_id
		and exists (
			select 1
			from public.posts
			where posts.id = comments.post_id
				and posts.visibility <> 'private'
		)
	);

create policy "comments_update_own" on public.comments
	for update
	to authenticated
	using ((select auth.uid()) = author_id)
	with check ((select auth.uid()) = author_id);

create policy "comments_delete_own" on public.comments
	for delete
	to authenticated
	using ((select auth.uid()) = author_id);
