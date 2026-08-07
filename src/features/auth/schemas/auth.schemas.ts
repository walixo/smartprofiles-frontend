import { z } from 'zod';
import type { TranslationKey } from '@/i18n/types';
import { SELF_SERVE_ROLES } from '@/shared/vocabulary';

export const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_COMPLEXITY = /^(?=.*[A-Za-z])(?=.*\d).+$/;

/**
 * Client mirrors of the server schemas.
 *
 * Messages are translation KEYS, not sentences — the form resolves them through
 * `t()` at render time so validation text follows the active locale. The server
 * remains the authority: anything it rejects is surfaced via `setError`.
 */
export function buildLoginSchema() {
  return z.object({
    email: z.email(key('validation.email')).min(1, key('validation.required')),
    password: z.string().min(1, key('validation.required')),
  });
}

export function buildRegisterSchema() {
  return z.object({
    displayName: z
      .string()
      .trim()
      .min(2, key('validation.nameMin'))
      .max(60, key('validation.nameMax')),
    email: z.email(key('validation.email')).min(1, key('validation.required')),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, key('validation.passwordMin'))
      .regex(PASSWORD_COMPLEXITY, key('validation.passwordComplexity')),
    role: z.enum(SELF_SERVE_ROLES, { message: key('validation.roleRequired') }),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;

/** Narrows a literal to a TranslationKey so a typo fails the build. */
function key(value: TranslationKey): string {
  return value;
}

/**
 * Resolves a field error message.
 *
 * Client-side messages are translation keys; server-side messages are already
 * human sentences. `t` returns its argument unchanged when it is not a known
 * key, so both cases collapse into one call.
 */
export function resolveMessage(
  message: string | undefined,
  t: (k: TranslationKey) => string,
): string | undefined {
  return message ? t(message as TranslationKey) : undefined;
}
