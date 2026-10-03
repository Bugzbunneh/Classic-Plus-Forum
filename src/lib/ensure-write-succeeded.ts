import { redirectWithError } from "@/lib/redirect-with-error";

type WriteResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

/**
 * Redirects back to `path` with an error unless the write changed at least
 * one row. When RLS blocks an update or delete it doesn't raise an error -
 * the write just matches zero rows - so the row count is the only signal.
 * Chain `.select("id")` onto the write so the changed rows come back.
 */
export function ensureWriteSucceeded(result: WriteResult, path: string): void {
  if (result.error) {
    redirectWithError(path, result.error.message);
  }

  if (!result.data?.length) {
    redirectWithError(path, "You can't do that, or it no longer exists.");
  }
}
