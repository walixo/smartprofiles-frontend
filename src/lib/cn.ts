export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

/**
 * Minimal class-name joiner.
 *
 * Hand-rolled because the stack forbids extra dependencies. Note that it does
 * NOT resolve Tailwind conflicts the way `tailwind-merge` would — variant maps
 * in this codebase are therefore written so their class sets never overlap.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      out.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
      continue;
    }

    for (const [key, enabled] of Object.entries(input)) {
      if (enabled) out.push(key);
    }
  }

  return out.join(' ');
}
