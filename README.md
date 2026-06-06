# MicroBlog

A modern, secure, and privacy-first social microblogging application built using **Svelte 5 (Runes)**, **SvelteKit**, **TypeScript**, and **Supabase (PostgreSQL, SSR Auth, RLS)**. Designed with strict performance boundaries, strict content constraints, and robust database-level security policies.

---

## Key Features

- **100-Word Constraint:** Content limits are strictly enforced both client-side and server-side to keep blogging clean and concise. Word count tokenization handles whitespaces, symbols, and formatting.
- **Granular Visibility Controls:**
  - `private`: Invisible to all except the author. Interactions (likes/comments) are locked down at the UI and database levels.
  - `followers`: Restrained to approved followers and the author.
  - `public`: Visible to all visitors.
- **Secure Follower Model:** A bidirectional follow system supporting follow requests, cancellation, approvals, and unfollow actions. Follow verification is enforced through database relationships to avoid spoofing.
- **Metric-Driven Interactions:**
  - **Post Voting:** One vote (like/dislike) per user per post, enforced via PostgreSQL uniqueness constraints.
  - **Two-Tier Comments:** Comments support up to 500 characters. Nested conversations are allowed up to a single level (replies to comments), with deeper nesting blocked by custom PL/pgSQL triggers.
- **Rich Text Composer:** Features a real-time WYSIWYG editor built on **Tiptap**, supporting bold, italic, strike, code blocks, lists, blockquotes, horizontal rules, and dynamic word counts. Supports smooth state synchronization with raw form boundaries.
- **Intelligent Notification System:** Real-time updates notifying users of votes, comments, replies, follow requests, and follow approvals. Built with deduplication indexing to prevent notification clutter. Supports marking as read, global reads, and soft-delete dismissals.

---

## Architecture Design

### 1. Reactivity via Svelte 5 Runes

The application is built on the next-generation Svelte 5 compile-time runtime, utilizing runes like `$state()`, `$derived()`, and `$effect()` for granular DOM updates.

### 2. Request-Level Auth Session Caching

To minimize overhead, database client initialization and session lookup are performed inside `src/hooks.server.ts`. The authentication state checks run in a request-scoped promise (`safeGetSession`), preventing redundant round-trips to Supabase during parallel loader executions.

### 3. Database-Level Constraint Enforcement

Security is not only handled at the SvelteKit application boundary but also fully enforced at the PostgreSQL level.

- **Comment Depth Trigger:** Deep nested spam replies are rejected by a database trigger preventing `parent_id` hierarchy beyond level 1.
- **Row-Level Security (RLS):** Every table enforces strict isolation. For example, comments or votes on `private` posts are rejected at the database level.

---

## Technology Stack

| Layer                  | Technology                              | Architectural Role                                                                 |
| :--------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------- |
| **Frontend Framework** | Svelte 5.55.2 / SvelteKit 2.57.0        | Component rendering, server-side page loaders, form actions, routing               |
| **Language**           | TypeScript 6.0.2                        | Compile-time safety, strict type structures (database tables & posts UI contracts) |
| **Database & Auth**    | Supabase (PostgreSQL) / `@supabase/ssr` | Database engine, cookie-based session management, secure storage                   |
| **Rich Text Editor**   | Tiptap 3.23.4                           | WYSIWYG editor with character counters and keyboard shortcut bindings              |
| **Styling**            | Tailwind CSS v4.2.2                     | Tailwind v4 compilation via Vite plugin, typography & forms extension              |
| **Validation**         | Zod 4.4.3                               | Runtime validator schemas for forms and REST API endpoints                         |
| **Testing**            | Vitest 4.1.3 / Playwright 1.59.1        | Unit checks, browser unit tests, end-to-end user flow automation                   |

---

## Database Schema Blueprint
    
![Schema](./.github/MicroBlog-DB-Schema.png)

---

## Testing Strategy

The project employs two distinct automated verification layers, configured to run in parallel in the CI workflow:

1.  **Unit & Validator Tests (Vitest):**
    - Colocated `*.spec.ts` files.
    - Dual-project setup: a `server` environment running under Node for logic/validation, and a `client` environment for browser-based Svelte unit checking.
    - _Run command:_ `npm run test:unit`
2.  **End-to-End User Journeys (Playwright):**
    - Automates register, login, onboarding, post creation/deletion, visibility constraints, follow requests, follow approvals, and interactions checking.
    - _Run command:_ `npm run test:e2e`

---

## Local Setup & Installation

### Prerequisites

- Node.js (v22.x or later)
- Supabase Account or Local CLI instance

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd microblog
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

### 3. Database Migrations

Initialize the Supabase database. Apply the migrations in `supabase/migrations/` in chronological order:

1.  `20260525000000_add_social_visibility.sql` (Profiles, posts, follows, RLS)
2.  `20260526000000_add_votes_and_comments.sql` (Votes, comments, depth limits, RLS)
3.  `20260601000000_add_notifications.sql` (Notifications schema, deduplication indexes, RLS)
4.  `20260601001000_grant_notifications_access.sql` (Table permissions & grants)

### 4. Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Running Quality Verification

```bash
# Formatter check
npm run format:check

# TypeScript check
npm run check

# Full validation suite (Vitest + Playwright)
npm run test
```
