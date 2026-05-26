import type { PostCardPost, PostVisibility } from '$lib/types/posts';

export const visibilityOptions: Array<{
	value: PostVisibility;
	label: string;
	help: string;
	icon: 'globe' | 'users' | 'lock';
}> = [
	{
		value: 'public',
		label: 'Public',
		help: 'Anyone can read it on your profile.',
		icon: 'globe'
	},
	{
		value: 'followers',
		label: 'Followers',
		help: 'Approved followers can read it.',
		icon: 'users'
	},
	{ value: 'private', label: 'Private', help: 'Only you can see it.', icon: 'lock' }
];

export function isVisibility(value: unknown): value is PostVisibility {
	return value === 'private' || value === 'public' || value === 'followers';
}

export function visibilityLabel(value: PostVisibility) {
	return visibilityOptions.find((option) => option.value === value)?.label ?? 'Private';
}

export function visibilityHelp(value: PostVisibility) {
	return visibilityOptions.find((option) => option.value === value)?.help ?? '';
}

export function visibilityClass(value: PostVisibility) {
	if (value === 'public') return 'bg-emerald-50 text-emerald-700';
	if (value === 'followers') return 'bg-blue-50 text-blue-700';

	return 'bg-slate-100 text-slate-700';
}

export function formatPostDate(value: string) {
	const date = new Date(value);
	const now = new Date();
	const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const dayDiff = Math.round((nowStart - dateStart) / 86_400_000);
	const time = new Intl.DateTimeFormat(undefined, {
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);

	if (dayDiff === 0) return `Today at ${time}`;
	if (dayDiff === 1) return `Yesterday at ${time}`;

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);
}

export function wasEdited(post: Pick<PostCardPost, 'created_at' | 'updated_at'>) {
	if (!post.updated_at) return false;

	return (
		Math.abs(new Date(post.updated_at).getTime() - new Date(post.created_at).getTime()) > 1000
	);
}

export function authorName(post: Pick<PostCardPost, 'author'>) {
	return post.author?.display_name || post.author?.username || 'Unknown author';
}
