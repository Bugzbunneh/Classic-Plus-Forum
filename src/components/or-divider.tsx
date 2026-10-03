export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs tracking-widest text-charcoal-500 uppercase">
      <div className="h-px flex-1 bg-linear-to-r from-transparent to-charcoal-700" />
      or
      <div className="h-px flex-1 bg-linear-to-l from-transparent to-charcoal-700" />
    </div>
  );
}
