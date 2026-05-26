export type PostVisibility = 'private' | 'public' | 'followers';
export type PostVote = 'like' | 'dislike' | null;

export type PostAuthor = {
	id?: string;
	username: string | null;
	display_name: string | null;
};

export type PostCardPost = {
	id: string;
	author_id?: string;
	author?: PostAuthor | null;
	content: string;
	visibility: PostVisibility;
	created_at: string;
	updated_at?: string;
	word_count: number;
	likes?: number;
	dislikes?: number;
	userVote?: PostVote;
	commentCount?: number;
};

export type PostFormState = {
	action?: string;
	error?: string;
	message?: string;
	success?: boolean;
	postID?: string;
	content?: string;
	visibility?: unknown;
};
