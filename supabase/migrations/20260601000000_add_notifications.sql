-- =============================================================================
-- Step 1: Notification tables, indexes, and seed data
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. notification_kinds – lookup / reference table
-- ---------------------------------------------------------------------------
create table if not exists notification_kinds (
  key         text        primary key,
  description text,
  created_at  timestamptz not null default now()
);

-- Seed the initial notification kinds
insert into notification_kinds (key, description) values
  ('post_vote',        'Someone voted on your post'),
  ('post_comment',     'Someone commented on your post'),
  ('comment_reply',    'Someone replied to your comment'),
  ('follow_request',   'Someone sent you a follow request'),
  ('follow_accepted',  'Someone accepted your follow request')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 2. notifications – main notification table
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id            uuid        primary key default gen_random_uuid(),
  recipient_id  uuid        not null references profiles(id) on delete cascade,
  actor_id      uuid        references profiles(id) on delete set null,
  kind          text        not null references notification_kinds(key),
  post_id       uuid        references posts(id) on delete cascade,
  comment_id    uuid        references comments(id) on delete cascade,
  follow_id     uuid        references follows(id) on delete cascade,
  metadata      jsonb       not null default '{}'::jsonb,
  read_at       timestamptz,
  dismissed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Partial indexes for efficient querying
-- ---------------------------------------------------------------------------

-- Non-dismissed notifications ordered by time (primary panel/page query)
create index if not exists idx_notifications_recipient_active
  on notifications (recipient_id, created_at desc)
  where dismissed_at is null;

-- Unread + non-dismissed notifications (badge count query)
create index if not exists idx_notifications_recipient_unread
  on notifications (recipient_id, created_at desc)
  where read_at is null and dismissed_at is null;

-- ---------------------------------------------------------------------------
-- 4. Dedupe index – prevent duplicate active notification per actor/post/recipient/kind
--    For example, one active vote notification per actor per post per recipient.
-- ---------------------------------------------------------------------------
create unique index if not exists idx_notifications_dedupe
  on notifications (recipient_id, actor_id, kind, coalesce(post_id, '00000000-0000-0000-0000-000000000000'))
  where dismissed_at is null;

-- ---------------------------------------------------------------------------
-- 5. Grants – allow authenticated users to interact via RLS
-- ---------------------------------------------------------------------------
alter table notification_kinds enable row level security;
alter table notifications enable row level security;

-- notification_kinds: read-only for authenticated users
create policy "Authenticated users can read notification kinds"
  on notification_kinds for select
  to authenticated
  using (true);

-- notifications: users can read only their own
create policy "Users can read own notifications"
  on notifications for select
  to authenticated
  using (recipient_id = auth.uid());

-- notifications: users can update only their own notification state (read_at, dismissed_at)
create policy "Users can update own notification state"
  on notifications for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- notifications: allow authenticated inserts (server-side creates via the supabase client)
-- Constrain so users can only set themselves as actor_id (prevents spoofing)
create policy "Authenticated users can insert notifications"
  on notifications for insert
  to authenticated
  with check (actor_id = auth.uid());

-- Users cannot delete notification rows
-- (no DELETE policy is created intentionally)
