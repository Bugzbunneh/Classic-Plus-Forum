import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCategoryActivitySummaries } from "@/lib/queries/categories";
import { formatRelativeTime } from "@/lib/format-relative-time";

export default async function Home() {
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("sections")
    .select("id, name, categories(id, name, slug, description)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "categories" });

  const categoryActivity = await getCategoryActivitySummaries(supabase);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      {sections?.map((section) => (
        <div key={section.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gold-400">
            {section.name}
          </h2>

          <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
            {section.categories.map((category) => {
              const activity = categoryActivity.get(category.id);
              const threadCount = activity?.threadCount ?? 0;
              const totalPostCount = activity?.totalPostCount ?? 0;
              const lastActivity = activity?.lastActivity ?? null;

              return (
                <li key={category.id} className="p-4 hover:bg-charcoal-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/c/${category.slug}`} className="min-w-0 sm:flex-1">
                      <span className="font-medium text-green-400">
                        {category.name}
                      </span>
                      {category.description && (
                        <p className="text-sm text-charcoal-400">
                          {category.description}
                        </p>
                      )}
                    </Link>

                    <span className="shrink-0 text-sm text-charcoal-400 sm:text-right">
                      {threadCount} {threadCount === 1 ? "thread" : "threads"}
                      <br />
                      {totalPostCount} {totalPostCount === 1 ? "post" : "posts"}
                    </span>

                    <div className="min-w-0 shrink-0 text-sm sm:w-48">
                      {lastActivity ? (
                        <>
                          <Link
                            href={`/c/${category.slug}/${lastActivity.postSlug}`}
                            className="block truncate text-green-400 hover:underline"
                          >
                            {lastActivity.postTitle}
                          </Link>
                          <p className="truncate text-charcoal-400">
                            by {lastActivity.authorName} &middot;{" "}
                            {formatRelativeTime(new Date(lastActivity.createdAt))}
                          </p>
                        </>
                      ) : (
                        <span className="text-charcoal-500">No activity yet</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </main>
  );
}
