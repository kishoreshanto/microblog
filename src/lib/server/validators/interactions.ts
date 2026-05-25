import { z } from 'zod';

export const voteSchema = z.object({
	postID: z.string().uuid('Invalid post.'),
	voteType: z.enum(['like', 'dislike'])
});

export const removeVoteSchema = z.object({
	postID: z.string().uuid('Invalid post.')
});

export const createCommentSchema = z.object({
	postID: z.string().uuid('Invalid post.'),
	parentID: z.string().uuid('Invalid parent comment.').optional(),
	content: z.string().trim().min(1, 'Comment cannot be empty.').max(500, 'Comment is too long.')
});

export const deleteCommentSchema = z.object({
	commentID: z.string().uuid('Invalid comment.')
});

export function voteTypeToValue(voteType: 'like' | 'dislike') {
	return voteType === 'like' ? 1 : -1;
}

export function voteValueToType(voteValue: number | null | undefined) {
	if (voteValue === 1) return 'like';
	if (voteValue === -1) return 'dislike';

	return null;
}
