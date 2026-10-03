/**
 * Shown instantly while any page's data loads, so navigation always gets
 * immediate feedback instead of the old page sitting there.
 */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12"
    >
      <div className="flex items-center gap-4">
        <div className="skeleton size-16 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="skeleton h-7 w-1/2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>

      <div className="panel flex flex-col">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4 border-b border-charcoal-700/60 px-5 py-4 last:border-b-0">
            <div className="skeleton size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/3" />
            </div>
            <div className="skeleton h-4 w-10" />
          </div>
        ))}
      </div>
    </main>
  );
}
