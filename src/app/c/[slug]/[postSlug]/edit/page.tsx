import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { isModerator } from "@/lib/roles";
import { updatePost } from "@/lib/actions/posts";
import { Composer } from "@/components/composer";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug, postSlug } = await params;
  const { error } = await searchParams;
  const profile = await requireProfile(`/c/${slug}/${postSlug}/edit`);

  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) {
    notFound();
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body, image_url, author_id, is_deleted")
    .eq("category_id", category.id)
    .eq("slug", postSlug)
    .single();

  if (!post || post.is_deleted) {
    notFound();
  }

  if (post.author_id !== profile.id && !isModerator(profile.role)) {
    redirect(`/c/${slug}/${postSlug}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal-200">Edit post</h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}

      <form
        action={updatePost.bind(null, slug, postSlug, post.id)}
        encType="multipart/form-data"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm text-charcoal-300">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post.title}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="text-sm text-charcoal-300">
            Message
          </label>
          <Composer
            id="body"
            defaultValue={post.body}
            existingImageUrl={post.image_url}
            required
            rows={8}
          />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Save
        </button>
      </form>
    </main>
  );
}
