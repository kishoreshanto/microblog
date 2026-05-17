export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					username: string;
					display_name: string | null;
					bio: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					username: string;
					display_name?: string | null;
					bio?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					username?: string;
					display_name?: string | null;
					bio?: string | null;
					updated_at?: string;
				};
			};
			posts: {
				Row: {
					id: string;
					author_id: string;
					content: string;
					word_count: number;
					visibility: 'private' | 'public' | 'followers';
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					author_id: string;
					content: string;
					word_count: number;
					visibility?: 'private' | 'public' | 'followers';
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					content?: string;
					word_count?: number;
					visibility?: 'private' | 'public' | 'followers';
					updated_at?: string;
				};
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};