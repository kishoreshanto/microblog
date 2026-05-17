import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import type { Database } from "$lib/types/database";
import { createServerClient } from "@supabase/ssr";
import type { Handle } from "@sveltejs/kit";

// Hook for handling requests and setting up Supabase client in locals
export const handle: Handle = async({ event, resolve }) => {
    // Set up Supabase client in locals for server-side usage using the createServerClient function from @supabase/ssr
    event.locals.supabase = createServerClient<Database>(
        PUBLIC_SUPABASE_URL, 
        PUBLIC_SUPABASE_PUBLISHABLE_KEY), {
            // Provide a way to get and set cookies in the Supabase client for server-side usage
            cookies: {
                // Get all cookies from the request
                getAll: () => event.cookies.getAll(),
                // Set multiple cookies in the response
                setAll: (cookiesToSet) => {
                    for (const {name, value, options} of cookiesToSet) {
                        event.cookies.set(name, value, {
                            ...options,
                            path: '/'
                        });
                    }
                } 
            }
    };

    // 
    event.locals.safeGetSession = async () => {
        // Attempt to get the user session from Supabase
        const {data: {user}, error} = await event.locals.supabase.auth.getUser();

        if (error || !user) {
            return { session: null, user: null };
        }

        const {data: {session}} = await event.locals.supabase.auth.getSession();

        return { session, user };
    };

    // Filter out specific headers from the response to avoid issues with serialization in SvelteKit
    return resolve (event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version';
        }
    });
};

