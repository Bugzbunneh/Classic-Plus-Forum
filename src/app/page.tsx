import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("sections")
    .select("id, name, categories(id, name, slug, description)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "categories" });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      {sections?.map((section) => (
        <div key={section.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gold-400">
            {section.name}
          </h2>

          <ul className="flex flex-col divide-y divide-charcoal-700 rounded border border-charcoal-700 bg-charcoal-900">
            {section.categories.map((category) => (
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
        </div>
      ))}
    </main>
  );
}
