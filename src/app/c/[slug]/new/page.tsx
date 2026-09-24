import { createPost } from "@/lib/actions/posts";
import { requireProfile } from "@/lib/dal";
import { Composer } from "@/components/composer";

export default async function NewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  await requireProfile(`/c/${slug}/new`);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold text-charcoal-200">New post</h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}

      <form
        action={createPost.bind(null, slug)}
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
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="text-sm text-charcoal-300">
            Message
          </label>
          <Composer id="body" required rows={8} />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-600"
        >
          Post
        </button>
      </form>
    </main>
  );
}
