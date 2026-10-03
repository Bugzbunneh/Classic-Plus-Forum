import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { isModerator } from "@/lib/roles";
import { updatePost } from "@/lib/actions/posts";
import { Composer } from "@/components/composer";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Edit thread" };

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
    <PageContainer>
      <Link
        href={`/c/${slug}/${postSlug}`}
        className="group flex w-fit items-center gap-1.5 text-sm text-charcoal-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" />
        Back to thread
      </Link>

      <PageHeader eyebrow={category.name} title="Edit thread" />

      <ErrorBanner message={error} />

      <form
        action={updatePost.bind(null, slug, postSlug, post.id)}
        encType="multipart/form-data"
        className="panel flex animate-rise-in flex-col gap-5 p-5 sm:p-6"
      >
        <Field label="Title" htmlFor="title">
          <input id="title" name="title" required defaultValue={post.title} className="input" />
        </Field>
        <Field label="Message" htmlFor="body">
          <Composer id="body" defaultValue={post.body} existingImageUrl={post.image_url} required rows={8} />
        </Field>
        <div className="flex justify-end gap-2">
          <Link href={`/c/${slug}/${postSlug}`} className="btn btn-secondary">
            Cancel
          </Link>
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </form>
    </PageContainer>
  );
}
