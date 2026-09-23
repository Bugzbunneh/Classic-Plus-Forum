import { redirect } from "next/navigation";
import { createPost } from "@/lib/actions/posts";
import { getCurrentProfile } from "@/lib/dal";

export default async function NewPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/c/${slug}/new`)}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-12">
      <h1 className="text-2xl font-semibold">New post</h1>

      {error && (
        <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form
        action={createPost.bind(null, slug)}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="rounded border border-zinc-700 bg-transparent px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="text-sm">
            Message
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={8}
            className="rounded border border-zinc-700 bg-transparent px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-600"
        >
          Post
        </button>
      </form>
    </main>
  );
}
