export type PageRange = { page: number; from: number; to: number };

export function getPageRange(pageParam: string | undefined, pageSize: number): PageRange {
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, from, to };
}

export function getTotalPages(totalCount: number | null, pageSize: number): number {
  return Math.max(1, Math.ceil((totalCount ?? 0) / pageSize));
}
