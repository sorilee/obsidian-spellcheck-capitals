interface CodePoint {
  readonly char: string;
  readonly length: number;
}

const MIN_MATCHED_WORD_LENGTH = 2;
const UPPERCASE_LETTER_RE = compileCharacterRegex('\\p{Lu}', '[A-Z]');
const WORD_BODY_RE = compileCharacterRegex('[\\p{L}\\p{M}\\p{Nd}]', '[A-Za-z0-9]');
const COUNTED_WORD_BODY_RE = compileCharacterRegex('[\\p{L}\\p{Nd}]', '[A-Za-z0-9]');
const JOINER_RE = compileCharacterRegex("['’\\p{Pd}]", "['’\\-‑‒–—―]");

function compileCharacterRegex(unicodeSource: string, fallbackSource: string): RegExp {
  try {
    return new RegExp(`^${unicodeSource}$`, 'u');
  } catch {
    return new RegExp(`^${fallbackSource}$`, 'u');
  }
}

function readCodePoint(text: string, index: number): CodePoint {
  const codePoint = text.codePointAt(index);

  if (codePoint === undefined) {
    throw new RangeError(`Index ${index} is outside the string bounds.`);
  }

  const char = String.fromCodePoint(codePoint);
  return {
    char,
    length: char.length,
  };
}

function isUppercaseLetter(char: string): boolean {
  return UPPERCASE_LETTER_RE.test(char);
}

function isWordBodyChar(char: string): boolean {
  return WORD_BODY_RE.test(char);
}

function isCountedWordBodyChar(char: string): boolean {
  return COUNTED_WORD_BODY_RE.test(char);
}

function isJoinerChar(char: string): boolean {
  return JOINER_RE.test(char);
}

function readPreviousCodePoint(text: string, index: number): CodePoint | null {
  if (index <= 0) {
    return null;
  }

  let previousIndex = index - 1;
  const trailingCodeUnit = text.charCodeAt(previousIndex);

  if (
    previousIndex > 0
    && trailingCodeUnit >= 0xdc00
    && trailingCodeUnit <= 0xdfff
  ) {
    const leadingCodeUnit = text.charCodeAt(previousIndex - 1);

    if (leadingCodeUnit >= 0xd800 && leadingCodeUnit <= 0xdbff) {
      previousIndex -= 1;
    }
  }

  return readCodePoint(text, previousIndex);
}

function hasWordBoundaryBefore(text: string, index: number): boolean {
  const previous = readPreviousCodePoint(text, index);

  return previous === null || (!isWordBodyChar(previous.char) && !isJoinerChar(previous.char));
}

/**
 * Visit every capitalized word in a text fragment.
 *
 * A capitalized word is defined as a token that:
 * - starts at a word boundary;
 * - starts with an uppercase letter; and
 * - continues with letters, marks, digits, apostrophes, or dashes.
 */
export function forEachCapitalizedWordRange(
  text: string,
  visitor: (from: number, to: number) => void,
): void {
  let index = 0;

  while (index < text.length) {
    const current = readCodePoint(text, index);

    if (!isUppercaseLetter(current.char) || !hasWordBoundaryBefore(text, index)) {
      index += current.length;
      continue;
    }

    let cursor = index + current.length;
    let countedCharacters = 1;

    while (cursor < text.length) {
      const next = readCodePoint(text, cursor);

      if (isWordBodyChar(next.char)) {
        cursor += next.length;

        if (isCountedWordBodyChar(next.char)) {
          countedCharacters += 1;
        }

        continue;
      }

      if (isJoinerChar(next.char)) {
        const afterJoinerIndex = cursor + next.length;

        if (afterJoinerIndex >= text.length) {
          break;
        }

        const afterJoiner = readCodePoint(text, afterJoinerIndex);

        if (!isWordBodyChar(afterJoiner.char)) {
          break;
        }

        cursor = afterJoinerIndex + afterJoiner.length;

        if (isCountedWordBodyChar(afterJoiner.char)) {
          countedCharacters += 1;
        }

        continue;
      }

      break;
    }

    if (countedCharacters >= MIN_MATCHED_WORD_LENGTH) {
      visitor(index, cursor);
    }

    index = cursor;
  }
}

export function findCapitalizedWordRanges(
  text: string,
): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = [];

  forEachCapitalizedWordRange(text, (from, to) => {
    ranges.push({ from, to });
  });

  return ranges;
}
