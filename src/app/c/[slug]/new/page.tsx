import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/lib/actions/posts";
import { requireProfile } from "@/lib/dal";
import { getCategoryBySlug } from "@/lib/queries/categories";
import { categoryIcon } from "@/lib/category-icons";
import { Composer } from "@/components/composer";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "New thread" };

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

  const supabase = await createClient();
  const category = await getCategoryBySlug(supabase, slug);
  if (!category) {
    notFound();
  }

  return (
    <PageContainer>
      <Link
        href={`/c/${slug}`}
        className="group flex w-fit items-center gap-1.5 text-sm text-charcoal-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 ease-spring group-hover:-translate-x-1" />
        {category.name}
      </Link>

      <PageHeader eyebrow={category.name} title="Start a new thread" icon={categoryIcon(slug)} />

      <ErrorBanner message={error} />

      <form
        action={createPost.bind(null, slug)}
        encType="multipart/form-data"
        className="panel flex animate-rise-in flex-col gap-5 p-5 sm:p-6"
      >
        <Field label="Title" htmlFor="title">
          <input id="title" name="title" required placeholder="What's on your mind?" className="input" />
        </Field>
        <Field label="Message" htmlFor="body">
          <Composer id="body" required rows={8} />
        </Field>
        <SubmitButton className="btn btn-primary self-end">Post thread</SubmitButton>
      </form>
    </PageContainer>
  );
}
