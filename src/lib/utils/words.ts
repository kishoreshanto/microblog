// Word counter, 100 words per post

// Gives the word count of a given string
export function countWords(value: string): number {
	const normalized = value.trim();

	if (!normalized) {
		return 0;
	}

	return normalized.split(/\s+/).length;
}

// Checks if the given string is within the specified word limit (default is 100)
export function isWithinWordLimit(value: string, limit = 100): boolean {
	return countWords(value) <= limit;
}
