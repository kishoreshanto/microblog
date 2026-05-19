// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Database } from '$lib/types/database';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

type SafeSession = {
	session: Session | null;
	user: User | null;
};

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface Locals {
			supabase: SupabaseClient<Database>;
			safeSessionPromise?: Promise<SafeSession>;
			safeGetSession: () => Promise<SafeSession>;
		}

		interface PageData {
			session: Session | null;
			user: User | null;
		}
	}
}

export {};
