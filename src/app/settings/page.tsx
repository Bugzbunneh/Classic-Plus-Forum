import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/dal";
import { uploadAvatar } from "@/lib/actions/profile";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/settings");
  }

  const { error, success } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">Settings</h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded border border-green-800 bg-green-950 px-3 py-2 text-sm text-green-400">
          Avatar updated.
        </p>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-sm text-charcoal-300">Avatar</span>
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-charcoal-800" />
          )}
        </div>

        <form
          action={uploadAvatar}
          encType="multipart/form-data"
          className="flex flex-col gap-3"
        >
          <input
            name="avatar"
            type="file"
            accept="image/*"
            required
            className="text-sm text-charcoal-300"
          />
          <button
            type="submit"
            className="self-start rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Upload
          </button>
        </form>
      </div>
    </main>
  );
}
