import Link from "next/link";
import { getCurrentProfile } from "@/lib/dal";
import { logout } from "@/lib/actions/auth";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="flex items-center justify-between border-b border-charcoal-700 bg-charcoal-900 px-6 py-4">
      <Link href="/" className="text-lg font-semibold text-green-400">
        Classic Plus Forum
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        {profile ? (
          <>
            {(profile.role === "admin" || profile.role === "owner") && (
              <Link
                href="/admin/members"
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Members
              </Link>
            )}
            <span className="flex items-center text-charcoal-300">
              {profile.display_name}
              {profile.role !== "member" && (
                <span
                  className={`ml-2 rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                    profile.role === "owner"
                      ? "bg-gold-950 text-gold-400"
                      : "bg-green-950 text-green-400"
                  }`}
                >
                  {profile.role}
                </span>
              )}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-charcoal-400 hover:text-charcoal-200"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-charcoal-400 hover:text-charcoal-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-green-700 px-3 py-1.5 font-medium text-white hover:bg-green-600"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
