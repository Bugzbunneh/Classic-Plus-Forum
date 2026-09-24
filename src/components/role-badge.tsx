import type { Role } from "@/lib/roles";

/** Renders nothing for the default "member" role - there's nothing to call out. */
export function RoleBadge({
  role,
  className = "",
}: {
  role: Role | null | undefined;
  className?: string;
}) {
  if (!role || role === "member") {
    return null;
  }

  return (
    <span
      className={`w-fit rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
        role === "owner" ? "bg-gold-950 text-gold-400" : "bg-green-950 text-green-400"
      } ${className}`}
    >
      {role}
    </span>
  );
}
