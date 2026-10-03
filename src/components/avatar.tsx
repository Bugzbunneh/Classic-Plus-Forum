import type { Role } from "@/lib/roles";

const RING_BY_ROLE: Record<Role, string> = {
  owner: "ring-quality-legendary/80 shadow-[0_0_16px_-2px_rgb(255_128_0/0.55)]",
  admin: "ring-quality-epic/80 shadow-[0_0_16px_-2px_rgb(182_92_245/0.55)]",
  member: "ring-charcoal-600",
};

/** Ringed in the member's rank colour; officers and the guild master glow. */
export function Avatar({
  url,
  name,
  size = 32,
  role,
}: {
  url: string | null | undefined;
  name: string;
  size?: number;
  role?: Role | null;
}) {
  const ringClass = `ring-2 ${RING_BY_ROLE[role ?? "member"]}`;

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`shrink-0 rounded-full object-cover ${ringClass}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-green-800 to-charcoal-900 font-display font-bold text-gold-300 ${ringClass}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
