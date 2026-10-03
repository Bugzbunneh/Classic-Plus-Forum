import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={`${basePath}?${param}=${page - 1}`} className="group btn btn-secondary btn-sm">
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Previous
        </Link>
      ) : (
        <span className="w-23" />
      )}
      <span className="chip">
        Page <strong className="text-charcoal-100">{page}</strong> of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`${basePath}?${param}=${page + 1}`} className="group btn btn-secondary btn-sm">
          Next
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span className="w-23" />
      )}
    </nav>
  );
}
