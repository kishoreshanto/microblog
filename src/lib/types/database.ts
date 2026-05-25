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
			post_votes: {
				Row: {
					id: string;
					post_id: string;
					user_id: string;
					vote_type: 1 | -1;
					created_at: string;
				};
				Insert: {
					id?: string;
					post_id: string;
					user_id: string;
					vote_type: 1 | -1;
					created_at?: string;
				};
				Update: {
					id?: string;
					post_id?: string;
					user_id?: string;
					vote_type?: 1 | -1;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'post_votes_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'post_votes_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			comments: {
				Row: {
					id: string;
					post_id: string;
					author_id: string;
					parent_id: string | null;
					content: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					post_id: string;
					author_id: string;
					parent_id?: string | null;
					content: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					post_id?: string;
					author_id?: string;
					parent_id?: string | null;
					content?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'comments_post_id_fkey';
						columns: ['post_id'];
						isOneToOne: false;
						referencedRelation: 'posts';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'comments_author_id_fkey';
						columns: ['author_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'comments_parent_id_fkey';
						columns: ['parent_id'];
						isOneToOne: false;
						referencedRelation: 'comments';
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
