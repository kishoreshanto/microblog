// This file contains tests for the word counting and word limit utilities.

import { describe, expect, it } from 'vitest';
import { countWords, isWithinWordLimit } from './words';

describe('word utilities', () => {
	// Case 1: Test the countWords function
	it('returns 0 for empty text', () => {
		expect(countWords('')).toBe(0);
		expect(countWords('   ')).toBe(0);
	});
	// Case 2: Test the countWords function with normal text
	it('counts words separated by whitespace', () => {
		expect(countWords('hello world')).toBe(2);
		expect(countWords('hello   world\nagain')).toBe(3);
	});
	// Case 3: Test the isWithinWordLimit function with default limit
	it('allows text within the word limit', () => {
		expect(isWithinWordLimit('hello world', 100)).toBe(true);
	});
	// Case 4: Test the isWithinWordLimit function with custom limit
	it('rejects text over the word limit', () => {
		const text = Array.from({ length: 101 }, () => 'word').join(' ');
		expect(isWithinWordLimit(text, 100)).toBe(false);
	});
});
