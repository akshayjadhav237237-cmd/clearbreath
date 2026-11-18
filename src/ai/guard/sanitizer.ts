import { type Result, err, ok } from '../../shared/result';
import type { AiError } from '../contracts';
import { MAX_QUESTION_LENGTH } from '../../config/constants';

const INJECTION_PATTERNS: readonly RegExp[] = [
  /ignore\s+(?:previous|all|prior)/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /developer\s+message/i,
  /reveal.*(?:key|prompt|instruction)/i,
  /api[_\s-]?key/i,
  /jailbreak/i,
  /(?:system|assistant)\s*:/i,
  /```/,
  /<[a-zA-Z/][^>]*>/,
  /https?:\/\//i,
  /[A-Za-z0-9+/]{40,}={0,2}/,
];

/** Removes non-printable ASCII control characters and zero-width unicode formatters. */
function stripControlCharacters(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    const isControl =
      (code >= 0 && code <= 31) ||
      (code >= 127 && code <= 159) ||
      (code >= 8203 && code <= 8205) ||
      code === 65279;
    if (!isControl) {
      result += text[i];
    }
  }
  return result;
}

/** Normalizes and sanitizes user input, rejecting prompt injection attempts. */
export function sanitizeUserQuestion(
  rawQuestion: string | null | undefined
): Result<string | null, AiError> {
  if (rawQuestion === null || rawQuestion === undefined) {
    return ok(null);
  }

  const normalized = stripControlCharacters(rawQuestion.normalize('NFKC'))
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length === 0) {
    return err({
      code: 'injection',
      message: 'Question cannot be empty.',
    });
  }

  if (normalized.length > MAX_QUESTION_LENGTH) {
    return err({
      code: 'injection',
      message: `Question exceeds limit of ${MAX_QUESTION_LENGTH} characters.`,
    });
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return err({
        code: 'injection',
        message: 'Disallowed input or prompt injection pattern detected.',
      });
    }
  }

  return ok(normalized);
}
