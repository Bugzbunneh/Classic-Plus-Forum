import { redirect } from "next/navigation";

/**
 * Redirects back to `path` with `message` attached as an `?error=` query
 * param, for pages that render that param as an inline error banner.
 */
export function redirectWithError(path: string, message: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}error=${encodeURIComponent(message)}`);
}
