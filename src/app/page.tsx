import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("sort_order");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded border border-zinc-800">
        {categories?.map((category) => (
          <li key={category.id} className="p-4 hover:bg-zinc-900">
            <Link href={`/c/${category.slug}`} className="block">
              <span className="font-medium text-emerald-400">
                {category.name}
              </span>
              {category.description && (
                <p className="text-sm text-zinc-400">
                  {category.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
