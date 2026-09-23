export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(text: string): string {
  const base = slugify(text) || "post";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
