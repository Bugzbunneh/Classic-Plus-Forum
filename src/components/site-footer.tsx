export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/5 px-4 py-8 text-center text-xs text-charcoal-500 sm:px-6">
      <p>
        An unofficial fan project. World of Warcraft is a trademark of Blizzard Entertainment.
      </p>
      <p className="mt-1">
        Icons by Lorc and Delapouite from{" "}
        <a
          href="https://game-icons.net"
          className="text-charcoal-400 underline-offset-2 hover:text-gold-400 hover:underline"
        >
          game-icons.net
        </a>
        , licensed{" "}
        <a
          href="https://creativecommons.org/licenses/by/3.0/"
          className="text-charcoal-400 underline-offset-2 hover:text-gold-400 hover:underline"
        >
          CC BY 3.0
        </a>
        .
      </p>
    </footer>
  );
}
