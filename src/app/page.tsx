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
      <h1 className="text-2xl font-semibold text-charcoal-200">Categories</h1>

      <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
        {categories?.map((category) => (
          <li key={category.id} className="p-4 hover:bg-charcoal-800">
            <Link href={`/c/${category.slug}`} className="block">
              <span className="font-medium text-green-400">
                {category.name}
              </span>
              {category.description && (
                <p className="text-sm text-charcoal-400">
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
