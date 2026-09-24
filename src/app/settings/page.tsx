import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/dal";
import { updateProfile, uploadAvatar } from "@/lib/actions/profile";

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
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login?next=/settings");
  }

  const { error, success } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold text-charcoal-200">Settings</h1>

      {error && (
        <p className="rounded border border-danger-600 bg-danger-950 px-3 py-2 text-sm text-danger-400">
          {error}
        </p>
      )}
      {success && SUCCESS_MESSAGES[success] && (
        <p className="rounded border border-green-800 bg-green-950 px-3 py-2 text-sm text-green-400">
          {SUCCESS_MESSAGES[success]}
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

      <form action={updateProfile} className="flex flex-col gap-4">
        <span className="text-sm text-charcoal-300">Profile</span>
        <div className="flex flex-col gap-1">
          <label htmlFor="displayName" className="text-sm text-charcoal-400">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            defaultValue={profile.display_name}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-sm text-charcoal-400">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={500}
            defaultValue={profile.bio ?? ""}
            className="rounded border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-charcoal-200 focus:border-green-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          Save profile
        </button>
      </form>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-charcoal-300">Password</span>
        <Link
          href="/reset-password"
          className="self-start rounded border border-charcoal-600 px-4 py-2 text-sm text-charcoal-300 hover:text-charcoal-100"
        >
          Change password
        </Link>
      </div>
    </main>
  );
}
