const PLACEHOLDER_ORIGIN = "http://placeholder.invalid";

/**
 * Returns `value` only if it's a path on this site, otherwise "/". Guards the
 * post-login `next` redirect against being pointed off-site, e.g.
 * `//evil.example` or `/\evil.example`, which browsers treat as other hosts.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/")) {
    return "/";
  }

  let url: URL;
  try {
    url = new URL(value, PLACEHOLDER_ORIGIN);
  } catch {
    return "/";
  }

  if (url.origin !== PLACEHOLDER_ORIGIN) {
    return "/";
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
