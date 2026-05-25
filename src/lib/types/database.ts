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
					id?: string;
					username?: string;
					display_name?: string | null;
					bio?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			follows: {
				Row: {
					id: string;
					follower_id: string;
					following_id: string;
					status: 'pending' | 'approved';
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					follower_id: string;
					following_id: string;
					status?: 'pending' | 'approved';
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					follower_id?: string;
					following_id?: string;
					status?: 'pending' | 'approved';
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'follows_follower_id_fkey';
						columns: ['follower_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'follows_following_id_fkey';
						columns: ['following_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
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
					id?: string;
					author_id?: string;
					content?: string;
					word_count?: number;
					visibility?: 'private' | 'public' | 'followers';
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'posts_author_id_fkey';
						columns: ['author_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};
