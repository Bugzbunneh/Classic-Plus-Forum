import type { Role } from "@/lib/roles";

// Shown with WoW guild rank names, coloured by item rarity.
const RANKS: Record<Exclude<Role, "member">, { label: string; className: string }> = {
  owner: {
    label: "Guild Master",
    className: "border-quality-legendary/40 bg-quality-legendary/10 text-quality-legendary",
  },
  admin: {
    label: "Officer",
    className: "border-quality-epic/40 bg-quality-epic/10 text-quality-epic",
  },
};

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

  const rank = RANKS[role];

  return (
    <span
      className={`w-fit rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ${rank.className} ${className}`}
    >
      {rank.label}
    </span>
  );
}
