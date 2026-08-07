const TOKEN_KEY = 'smart-token';

/**
 * Storage access is wrapped because Safari private mode and hardened browser
 * settings throw on `localStorage` rather than returning null.
 */
export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* Session stays in memory only for this tab. */
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Nothing to clear. */
  }
}
