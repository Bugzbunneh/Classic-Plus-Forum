import Link from "next/link";
import { getCurrentProfile } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-emerald-400">
        Classic Plus Forum
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {profile ? (
          <>
            <span className="text-zinc-400">
              {profile.display_name}
              {profile.role !== "member" && (
                <span className="ml-1 rounded bg-emerald-900 px-1.5 py-0.5 text-xs uppercase text-emerald-300">
                  {profile.role}
                </span>
              )}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-zinc-400 hover:text-zinc-200"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-zinc-400 hover:text-zinc-200">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-600"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
