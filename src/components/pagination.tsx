import Link from "next/link";

/**
 * `basePath` is the page's own URL (e.g. `/c/general-discussion`); `param` is
 * the query param this pagination controls (e.g. "page" or "commentsPage"),
 * since a single page can have more than one independently-paginated list.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  param = "page",
}: {
  page: number;
  totalPages: number;
  basePath: string;
  param?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm text-charcoal-400">
      {page > 1 && (
        <Link href={`${basePath}?${param}=${page - 1}`} className="hover:text-charcoal-200">
          &larr; Previous
        </Link>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link href={`${basePath}?${param}=${page + 1}`} className="hover:text-charcoal-200">
          Next &rarr;
        </Link>
      )}
    </div>
  );
}
