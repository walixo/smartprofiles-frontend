/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute base URL of the API, including the `/api` prefix — for example
   * `http://localhost:4100/api`. Omit it to call the app's own origin and let
   * a proxy forward `/api`.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
