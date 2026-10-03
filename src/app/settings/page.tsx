import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CircleCheck, KeyRound } from "lucide-react";
import { requireProfile } from "@/lib/dal";
import { updateProfile, uploadAvatar } from "@/lib/actions/profile";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/storage";
import { staggerStyle } from "@/lib/stagger";
import { Avatar } from "@/components/avatar";
import { ErrorBanner } from "@/components/error-banner";
import { Field } from "@/components/field";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Settings" };

const SUCCESS_MESSAGES: Record<string, string> = {
  avatar: "Avatar updated.",
  profile: "Profile updated.",
  password: "Password updated.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const profile = await requireProfile("/settings");
  const { error, success } = await searchParams;
  const successMessage = success ? SUCCESS_MESSAGES[success] : undefined;

  return (
    <PageContainer width="narrow" className="max-w-xl">
      <PageHeader title="Settings" description="How the rest of the guild sees you." />

      <ErrorBanner message={error} />
      {successMessage && (
        <p
          role="status"
          className="flex animate-rise-in items-center gap-2.5 rounded-lg border border-green-700 bg-green-950/80 px-4 py-3 text-sm text-green-300 shadow-[0_0_24px_-8px_rgb(79_184_114/0.6)]"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
          {successMessage}
        </p>
      )}

      <SettingsSection title="Avatar" index={0}>
        <form action={uploadAvatar} encType="multipart/form-data" className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar url={profile.avatar_url} name={profile.display_name} size={72} role={profile.role} />
          <div className="flex flex-1 flex-col gap-3">
            <input
              name="avatar"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              required
              className="text-sm text-charcoal-400 file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-charcoal-600 file:bg-charcoal-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-charcoal-200 file:transition-colors hover:file:border-gold-700 hover:file:text-gold-300"
            />
            <p className="text-xs text-charcoal-500">PNG, JPEG, GIF, or WebP, up to 5MB.</p>
            <SubmitButton className="btn btn-secondary btn-sm self-start">Upload</SubmitButton>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Profile" index={1}>
        <form action={updateProfile} className="flex flex-col gap-4">
          <Field label="Display name" htmlFor="displayName">
            <input id="displayName" name="displayName" required defaultValue={profile.display_name} className="input" />
          </Field>
          <Field label="Bio" htmlFor="bio">
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={500}
              defaultValue={profile.bio ?? ""}
              placeholder="Main, alts, favourite raid, best loot drop..."
              className="input resize-y"
            />
          </Field>
          <SubmitButton className="btn btn-primary self-end">Save profile</SubmitButton>
        </form>
      </SettingsSection>

      <SettingsSection title="Password" index={2}>
        <Link href="/reset-password" className="group btn btn-secondary self-start">
          <KeyRound className="size-4 transition-transform duration-300 ease-spring group-hover:-rotate-45" />
          Change password
        </Link>
      </SettingsSection>
    </PageContainer>
  );
}

function SettingsSection({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <section
      className="panel stagger flex animate-rise-in flex-col gap-4 p-5 sm:p-6"
      style={staggerStyle(index + 1)}
    >
      <h2 className="heading text-base">{title}</h2>
      {children}
    </section>
  );
}
