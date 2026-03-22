import assert from 'node:assert/strict';
import test from 'node:test';

import { findCapitalizedWordRanges } from '../src/matcher';

function extractMatches(text: string): string[] {
  return findCapitalizedWordRanges(text).map(({ from, to }) => text.slice(from, to));
}

test('matches simple title-cased words', () => {
  assert.deepEqual(extractMatches('Alice met Bob in London.'), ['Alice', 'Bob', 'London']);
});

test('matches Unicode uppercase letters', () => {
  assert.deepEqual(extractMatches('Élodie met Łukasz in Zürich.'), ['Élodie', 'Łukasz', 'Zürich']);
});

test('supports apostrophes and dashes inside words', () => {
  assert.deepEqual(extractMatches("O'Neill discussed Jean-Luc with Mary-Jane."), [
    "O'Neill",
    'Jean-Luc',
    'Mary-Jane',
  ]);
});

test('does not match lowercase or camelCase words that do not start uppercase', () => {
  assert.deepEqual(extractMatches('obsidian eBay camelCase iPhone'), []);
});

test('does not match single-letter words', () => {
  assert.deepEqual(extractMatches('I met Al and Bob.'), ['Al', 'Bob']);
});
